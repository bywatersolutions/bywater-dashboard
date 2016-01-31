package DashboardApp::Controller::Reports;
use Mojo::Base 'Mojolicious::Controller';

sub get {
	my ( $c ) = shift;

	my $config = DashboardApp::Model::Config::get_config();
	$c->render(json => { config => $config->{reports} });
}

sub get_data {
	my ( $c ) = shift;

	my $json = $c->req->json;
	my $config = DashboardApp::Model::Config::get_config()->{reports};

	my $query = $config->{queries}->[ $json->{query} ]->{query};
	if ( length( $json->{department} ) ) {
		$query .= " AND " . $config->{departments}->[ $json->{department} ]->{query};
	}

	my $ids = $c->tickets_model->search_tickets( $query );
	my $tickets = $c->tickets_model->get_tickets( $ids );

	$c->render(json => { tickets => $tickets });
}

1;
