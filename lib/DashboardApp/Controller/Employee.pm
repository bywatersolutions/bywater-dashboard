package DashboardApp::Controller::Employee;
use Mojo::Base 'Mojolicious::Controller';

use DashboardApp::Model::User;
use DashboardApp::Model::Ticket;
use DashboardApp::Model::Config;

sub show_dashboard {
    my $c = shift;

    my ( $view_id, $columns ) = $c->model('View')->get( $c->session->{user_id}, $c->tickets_model, 'employee' );

    my $config = DashboardApp::Model::Config::get_config();

    $c->render( json => {
        view_id => $view_id,
        columns => $columns,
        queues => $c->tickets_model->get_queues(),
        statuses => DashboardApp::Model::Config::get_rt_statuses(),
        rt_users => $c->app->model('user')->get_rt_users(),
        header_rows => $config->{card_popup}->{header}->{rows},
    } );
}

sub save_columns {
    my $c = shift;

    my $json = $c->req->json;

    if ( ref( $json ) ne 'HASH' ) {
        return $c->render(json => { error => "Hash ref expected." });
    }

    foreach my $column_id ( keys %$json ) {
        my $column = $c->app->schema->resultset('Column')->find( $column_id );
        Mojo::Exception->throw('Security violation') unless ( $column->view->role->user_id == $c->session->{user_id} );

        my $ticket_ids = $json->{$column_id};
        foreach my $ticket_id ( @$ticket_ids ) {
            # FIXME user_id check
            $c->tickets_model->update_ticket( $ticket_id, { 'CF.{ToDo}' => 1 } );
        }
    }

    $c->render(json => { status => "ok" });
}

1;
