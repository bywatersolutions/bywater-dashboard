package DashboardApp::Controller::Lead;
use Mojo::Base 'Mojolicious::Controller';

use DashboardApp::Model::Column;
use DashboardApp::Model::User;

sub show_dashboard {
    my $c = shift;

    my $columns = $c->model('View')->get( $c->session->{user_id}, $c->tickets_model, 'lead' );
    my $users = $c->app->model('user')->get_all_users();

    ###

    $c->render(json => {
        columns => $columns,
        users => $users,
        rt_users => $c->app->model('user')->get_rt_users(),
        queues => $c->tickets_model->get_queues(),
        statuses => DashboardApp::Model::Config::get_rt_statuses()
    } );
}

1;
