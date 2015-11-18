package DashboardApp::Controller::Employee;
use Mojo::Base 'Mojolicious::Controller';

use DashboardApp::Model::Column;
use DashboardApp::Model::User;
use DashboardApp::Model::Ticket;
use DashboardApp::Model::Config;

sub show_dashboard {
    my $c = shift;

    my $columns = $c->model('View')->get( $c->session->{user_id}, $c->tickets_model, 'employee' );

    $c->render( json => {
        columns => $columns,
        queues => $c->tickets_model->get_queues(),
        statuses => DashboardApp::Model::Config::get_rt_statuses(),
        rt_users => $c->app->model('user')->get_rt_users()
    } );
}

sub save_columns {
    my $c = shift;

    my $json = $c->req->json;

    if ( ref( $json ) ne 'HASH' ) {
        return $c->render(json => { error => "Hash ref expected." });
    }

    my $columns = DashboardApp::Model::Column::load_columns( $c->session->{user_id}, 'employee_default_columns' );

    foreach my $column_id ( keys %$json ) {
        next unless ( $columns->{$column_id}->{type} eq "custom" );

        my $ticket_ids = $json->{$column_id};
        foreach my $ticket_id ( @$ticket_ids ) {
            # FIXME user_id check
            #$tickets->{$ticket_id}->{column_id} = $column_id;
            $c->tickets_model->update_ticket( $ticket_id, { 'CF.{ToDo}' => 1 } );
        }
    }

    $c->render(json => { status => "ok" });
}

1;
