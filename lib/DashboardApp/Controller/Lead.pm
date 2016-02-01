package DashboardApp::Controller::Lead;
use Mojo::Base 'Mojolicious::Controller';

use DashboardApp::Model::User;

sub show_dashboard {
    my $c = shift;

    my ( $view_id, $columns ) = $c->model('View')->get( $c->session->{user_id}, $c->tickets_model, 'lead' );
    my $users = $c->app->model('user')->get_all_users();

    my $config = DashboardApp::Model::Config::get_config();

    $c->render(json => {
        columns => $columns,
        users => $users,
        rt_users => $c->app->model('user')->get_rt_users(),
        queues => $c->tickets_model->get_queues(),
        custom_fields => $config->{rt}->{custom_fields} || [],
        statuses => DashboardApp::Model::Config::get_rt_statuses(),
        popup_config => $config->{card_popup},
    } );
}

1;
