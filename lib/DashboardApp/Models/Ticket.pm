package DashboardApp::Models::Ticket;

use strict;
use warnings;
use RT::Client::REST;
use DashboardApp::Models::Config;

my $config = DashboardApp::Models::Config::get_config();
my $credentials = $config->{rt} || die "RT credentials not found.";
my $rt = RT::Client::REST->new( server => $credentials->{host}, timeout => 3 );

sub search_tickets {
    my ( $search_query ) = @_;
    
    $rt->login( username => $credentials->{login}, password => $credentials->{password} );
    
    my @ids = $rt->search( type => 'ticket', query => $search_query );
    
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

1;

