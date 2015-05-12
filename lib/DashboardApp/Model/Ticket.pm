package DashboardApp::Model::Ticket;

use Mojo::Base -strict;
use RT::Client::REST;
use DashboardApp::Model::Config;

my $config = DashboardApp::Model::Config::get_config();
my $credentials = $config->{rt} || die "RT credentials not found.";
my $rt = RT::Client::REST->new( server => $credentials->{host}, timeout => 3 );
$rt->login( username => $credentials->{login}, password => $credentials->{password} );

my @queues;

sub get_queues {
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
    my ( $search_query ) = @_;
    my @ids = $rt->search( type => 'ticket', query => $search_query );
    return \@ids;
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

sub get_history {
  my ( $ticket_id ) = @_;
  
  my $response = $rt->_submit("ticket/$ticket_id/history")->decoded_content;
  
  my @lines = split("\n", $response);
  my @items;
  foreach my $line ( @lines ) {
    if (my ( $id, $descr ) = ( $line =~ /(\d+): (.*)/ ) ) {
      push( @items, { id => $id, descr => $descr } ) if ( $descr =~ /Ticket created/ or $descr =~ /Correspondence added/ );
    }
  }
  
  return [] unless ( @items );
  
  my @result;
  my @ids;
  push( @ids, $items[0]->{id} );
  push( @ids, $items[ @items - 1 ]->{id} ) if ( @items > 1 );
  
  foreach my $history_id ( @ids ) {
    my $response = $rt->_submit("ticket/$ticket_id/history/id/$history_id")->decoded_content;
    my @matches = map { $_ =~ s/(?:^(\s+)|(\s+)$)//g; $_ } ( $response =~ /(.*?): (.*?)\n(?!\s)/sg );
    my %fields = splice( @matches, 2 );
    push( @result, \%fields );
  }
  
  return \@result;
}

1;

