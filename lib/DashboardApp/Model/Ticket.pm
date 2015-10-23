package DashboardApp::Model::Ticket;

use Mojo::Base -strict;
use RT::Client::REST;
use DashboardApp::Model::Config;

use IO::Socket::SSL; # qw(debug3);
use Net::SSLeay;

my $config = DashboardApp::Model::Config::get_config();
die "RT configuration not found." unless ( $config->{rt} );

my $rt = RT::Client::REST->new( server => $config->{rt}->{host}, timeout => 3 );

if ( $config->{rt}->{ignore_ssl_errors} ) {
    IO::Socket::SSL::set_ctx_defaults( verify_mode => Net::SSLeay->VERIFY_NONE() );
    $rt->_ua->ssl_opts( verify_hostname => 0 );
}

$rt->login( username => $config->{rt}->{login}, password => $config->{rt}->{password} );

my @queues;

sub new {
    my ( $class, $memcached ) = @_;

    return bless( { memcached => $memcached }, $class );
}

sub get_queues {
    my ( $self ) = @_;

    if ( !@queues ) {
        my @ids = $rt->search( type => 'queue', query => "" );
        foreach my $id ( @ids ) {
            my $info = $rt->show( type => 'queue', id => $id );
            $info->{id} =~ /(\d+)$/;

            push( @queues, { id => $1, name => $info->{Name}, description => $info->{Description} } );
        }
    }

    return \@queues;
}

sub search_tickets {
    my ( $self, $search_query ) = @_;
    my @ids = $rt->search( type => 'ticket', query => $search_query );
    return \@ids;
}

sub get_tickets {
    my ( $self, $ids ) = @_;

    my $result = {};
    foreach my $id ( @$ids ) {
        $result->{$id} = $rt->show(type => 'ticket', id => $id);
        $result->{$id}->{link} = $config->{rt}->{host} . "/Ticket/Display.html?id=" . $id;
    }

    return $result;
}

sub update_ticket {
    my ( $self, $ticket_id, $params ) = @_;

    $rt->edit ( type => 'ticket', id => $ticket_id, set => $params );
}

sub get_history_entry {
    my ( $self, $ticket_id, $history_id ) = @_;

    my $cache_key = "history-entry-$history_id";
    my $cached_entry = $self->{memcached}->get($cache_key);
    return $cached_entry if ( $cached_entry );

    my $response = $rt->_submit("ticket/$ticket_id/history/id/$history_id")->decoded_content;
    my @matches = map { $_ =~ s/(?:^(\s+)|(\s+)$)//g; $_ } ( $response =~ /(.*?): (.*?)\n(?!\s)/sg );
    my $history_entry = { splice( @matches, 2 ) };

    $self->{memcached}->set( $cache_key, $history_entry );

    return $history_entry;
}

sub get_history {
    my ( $self, $ticket_id ) = @_;

    my $response = $rt->_submit("ticket/$ticket_id/history")->decoded_content;

    my @lines = split("\n", $response);
    my @items;
    foreach my $line ( @lines ) {
        if (my ( $id, $descr ) = ( $line =~ /(\d+): (.*)/ ) ) {
            push( @items, { id => $id, descr => $descr } );# if ( $descr =~ /Ticket created/ or $descr =~ /Correspondence added/ );
        }
    }

    return [] unless ( @items );

    return [ map { $self->get_history_entry( $ticket_id, $_->{id} ) } @items ];
}

sub add_correspondence {
    my ( $self, $ticket_id, $message ) = @_;
    $rt->correspond( ticket_id => $ticket_id, message => $message )
}

1;

