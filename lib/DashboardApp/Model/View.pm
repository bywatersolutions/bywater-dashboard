package DashboardApp::Model::View;
use Mojo::Base 'MojoX::Model';

sub get {
	my ( $self, $user_id, $tickets_model, $role, $view_id ) = @_;

	$role = $self->app->schema->resultset('UserRole')->search({ user_id => $user_id, role => $role })->first;
	my $view = $role->views->first;

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

	my $columns = {};
	foreach my $column ( $view->columns_rel( undef, { order_by => 'column_order' } )->all ) {
		next unless ( $column->rt_query );

		my $tickets = $tickets_model->search_tickets( $column->rt_query );
		$tickets = [ reverse( @$tickets ) ] if ( $column->column_sort and $column->column_sort eq "ticket_id_desc" );

		my $hashref = { $column->get_columns() };

		$hashref->{tickets} = [];
		foreach my $ticket_id ( @$tickets ) {
			push( @{ $hashref->{tickets} }, $ticket_id );
		}

		$columns->{ $column->column_id } = $hashref;
	}

	return ( $view->view_id, $columns );
}

1;