package DashboardApp::Model::User;

use Mojo::Base 'MojoX::Model';

sub get_all_users {
    my ( $self ) = @_;

    my $users = {};
    foreach my $user ( $self->app->schema->resultset('User')->search({})->all ) {
        my $hashref = { $user->get_columns };
        $hashref->{roles} = [ map { $_->role }  $user->user_roles->all ];
        $users->{ $user->rt_username } = $hashref;
    }

    return $users;
}

sub get_rt_users {
    my ( $self ) = @_;

    my $users = $self->get_all_users();
    my $result = {};
    foreach my $user_id ( keys %$users ) {
        my $user = $users->{ $user_id };
        $result->{ $user_id } = ( $user->{first_name} || "" ) . " " . ( $user->{last_name} || "" );
    }

    $result->{Nobody} = 'Nobody';

    return $result;
}

1;
