package DashboardApp::Controller::Test;
use Mojo::Base 'Mojolicious::Controller';

use JSON qw/to_json/;

sub test {
	my $c = shift;

	my $out = $c->model('View')->get( $c->session->{user_id}, $c->tickets_model, 'employee' );

	$c->render(text => to_json( $out, { pretty => 1, allow_nonref => 1 } ) );
}

1;