package DashboardApp::Models::Ticket;

use strict;
use warnings;
use RT::Client::REST;

sub get_tickets {
    my ( $credentials, $search_query ) = @_;
    
    my $rt = RT::Client::REST->new( server => $credentials->{host}, timeout => 3 );
    $rt->login( username => $credentials->{login}, password => $credentials->{password} );
    
    my @ids = $rt->search( type => 'ticket', query => $search_query );

    my $result = {};
    foreach my $id ( @ids ) {
        $result->{$id} = $rt->show(type => 'ticket', id => $id);
        $result->{$id}->{link} = $credentials->{host} . "/Ticket/Display.html?id=" . $id;
    }
    
    return $result;
}

1;

