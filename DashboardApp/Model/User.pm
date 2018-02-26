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

sub get_views {
    my ( $self, $user_id ) = @_;

    #FIXME this needs to be updated to insert the new views and return the result either way

	unless ( $view ) {
		$view = $self->app->schema->resultset('View')->create({ role_id => $role->role_id, name => "Default View" });
		my $config = DashboardApp::Model::Config::get_config();

		my $idx = 0;
		foreach my $col ( @{ $config->{ $role->role . '_default_columns' } } ) {
			my $params = {
				view_id      => $view->view_id,
				name         => $col->{name},
				type         => $col->{type},
				rt_query     => $col->{search_query},
				column_order => $idx++,
			};

			$params->{column_sort} = $col->{sort} if ( $col->{sort} );

			my $column = $self->app->schema->resultset('Column')->create( $params );
		}
	}
}

1;
