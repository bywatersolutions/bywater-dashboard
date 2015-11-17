package DashboardApp::Model::User;

use Mojo::Base -strict;
use Data::Dumper;

sub get_all_users {
    my ( $schema ) = @_;

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
