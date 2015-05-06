package DashboardApp::Model::User;

use Mojo::Base -strict;
use YAML qw/LoadFile/;
use Data::Dumper;

my $users = LoadFile("users.yaml");

sub check {
    my ( $login, $password ) = @_;
    
    return $users->{ $login }->{role} if ( defined $users->{ $login } and $users->{ $login }->{password} eq $password );
}

sub get_rt_creds {
    my ( $login ) = @_;
    
    return $users->{ $login }->{rt};
}

sub get_all_users {
    return $users;
}

1;