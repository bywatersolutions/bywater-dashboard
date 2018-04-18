package DashboardApp::Model::View;
use Mojo::Base 'MojoX::Model';

sub get {
	my ( $self, $user_id, $view_id, $tickets_model ) = @_;

	my $view = $self->app->schema->resultset('View')->find({ user_id => $user_id, view_id => $view_id });

	my $columns = {};
	foreach my $column ( $view->columns->all ) {
		$columns->{ $column->column_id } = {
            $column->get_columns(),
            %{ $self->fetch_column_results( $column, $tickets_model ) },
		};
	}

	return ( $view->view_id, $columns );
}

sub fetch_column_results {
    my ( $self, $column, $tickets_model ) = @_;

    $column = $self->app->schema->resultset('Column')->find({ column_id => $column }) unless ( ref $column );

    my $results = {};

    if ( defined $column->rt_query ) {
		my $tickets = $tickets_model->search_tickets( $column->rt_query );
		$tickets = [ reverse( @$tickets ) ] if ( $column->column_sort and $column->column_sort eq "ticket_id_desc" );

		$results->{tickets} = $tickets;
    }

    return $results;
}

1;
