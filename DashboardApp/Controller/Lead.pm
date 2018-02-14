package DashboardApp::Controller::Lead;
use Mojo::Base 'Mojolicious::Controller';

use DashboardApp::Model::User;

sub show_dashboard {
    my $c = shift;

    my ( $view_id, $columns ) = $c->model('View')->get( $c->session->{user_id}, $c->tickets_model, 'lead' );
    my $users = $c->app->model('user')->get_all_users();

    $c->render(json => {
        columns => $columns,
        users => $users,
    } );
}

1;
