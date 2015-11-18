package DashboardApp::Controller::Employee;
use Mojo::Base 'Mojolicious::Controller';

use DashboardApp::Model::Column;
use DashboardApp::Model::User;
use DashboardApp::Model::Ticket;
use DashboardApp::Model::Config;

sub show_dashboard {
    my $c = shift;

    ###

    my %tickets;
    my $columns = DashboardApp::Model::Column::load_columns( $c->session->{user_id}, 'employee_default_columns' );

    #####

    # FIXME fetch list of all opened tickets assigned to user and filter stuff here.
    #foreach my $column ( values %$columns ) {
    #    $column->{tickets} = [ grep { $tickets{ $_ } } @{ $column->{tickets} } ];
    #}

    #####

    # Fetching tickets from RT
    foreach my $column_id ( keys %$columns ) {
        my $column = $columns->{$column_id};
        next unless ( $column->{search_query} );

        my $query = $column->{search_query};

        my $tickets = $c->tickets_model->search_tickets( $query );
        $tickets = [ reverse( @$tickets ) ] if ( $column->{sort} and $column->{sort} eq "ticket_id_desc" );

        my $error = "";

        $column->{tickets} = [];
        foreach my $ticket_id ( @$tickets ) {
            push( @{ $column->{tickets} }, $ticket_id );
        }

        return $c->render( json => { error => $error } ) if ( $error );
    }

    ###

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
