package DashboardApp::Model::User;

use Mojo::Base -strict;
use YAML qw/LoadFile/;
use Data::Dumper;

sub check {
    my ( $login, $password ) = @_;
    my $users = LoadFile("users.yaml");
    return $users->{ $login }->{roles} if ( defined $users->{ $login } and $users->{ $login }->{password} eq $password );
}

sub get_rt_creds {
    my ( $login ) = @_;
    my $users = LoadFile("users.yaml");
    return $users->{ $login }->{rt};
}

sub get_all_users {
    my $users = LoadFile("users.yaml");
    return $users;
}

sub get_rt_users {
    my $users = get_all_users();
    my $result = {};
    foreach my $user ( values %$users ) {
        next unless ( $user->{rt_user_id} );
        $result->{ $user->{rt_user_id} } = ( $user->{first_name} || "" ) . " " . ( $user->{last_name} || "" );
    }

    $result->{Nobody} = 'Nobody';

    return $result;
}

1;
