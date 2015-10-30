package DashboardApp::Model::User;

use Mojo::Base -strict;
use YAML qw/LoadFile/;
use Data::Dumper;

sub check {
    my ( $login ) = @_;
    my $users = LoadFile("users.yaml");
    return $users->{ $login }->{roles} if ( defined $users->{ $login } );
}

sub get_all_users {
    my $users = LoadFile("users.yaml");
    return $users;
}

sub get_rt_users {
    my $users = get_all_users();
    my $result = {};
    foreach my $user_id ( keys %$users ) {
        my $user = $users->{ $user_id };
         $result->{ $user_id } = ( $user->{first_name} || "" ) . " " . ( $user->{last_name} || "" );
    }

    $result->{Nobody} = 'Nobody';

    return $result;
}

1;
