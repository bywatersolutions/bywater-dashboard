package DashboardApp::Model::Ticket;

use Mojo::Base -strict;
use RT::Client::REST;
use DashboardApp::Model::Config;

my $config = DashboardApp::Model::Config::get_config();
my $credentials = $config->{rt} || die "RT credentials not found.";
my $rt = RT::Client::REST->new( server => $credentials->{host}, timeout => 3 );
$rt->login( username => $credentials->{login}, password => $credentials->{password} );

sub search_tickets {
    my ( $search_query ) = @_;
    
    my @ids = $rt->search( type => 'ticket', query => $search_query );
    
    @ids = splice( @ids, 0, 20 ); # TODO has to be some limit
    
    return get_tickets( \@ids );
}

sub get_tickets {
    my ( $ids ) = @_;

    my $result = {};
    foreach my $id ( @$ids ) {
        $result->{$id} = $rt->show(type => 'ticket', id => $id);
        $result->{$id}->{link} = $credentials->{host} . "/Ticket/Display.html?id=" . $id;
    }
    
    return $result;
}

sub update_ticket {
    my ( $ticket_id, $params ) = @_;
    
    $rt->edit ( type => 'ticket', id => $ticket_id, set => $params );
}

1;

