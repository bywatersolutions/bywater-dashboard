package DashboardApp::Model::View;
use Mojo::Base 'MojoX::Model';

sub get {
	my ( $self, $user_id, $tickets_model, $view_id ) = @_;

	my $view = $self->app->schema->find('View')->search({ user_id => $user_id, view_id => $view_id });

	my $columns = {};
	foreach my $column ( $view->columns_rel()->all ) {
		next unless ( defined $column->rt_query );

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
