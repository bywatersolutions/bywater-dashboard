package DashboardApp::Models::User;

use strict;
use warnings;
use YAML qw/LoadFile/;
use Data::Dumper;

my $users = LoadFile("users.yaml");

sub check {
    my ( $login, $password ) = @_;
    
    return 1 if ( defined $users->{ $login } and $users->{ $login }->{password} eq $password );
}

sub get_rt_creds {
    my ( $login ) = @_;
    
    return $users->{ $login }->{rt};
}

1;