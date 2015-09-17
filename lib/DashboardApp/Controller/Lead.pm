package DashboardApp::Controller::Lead;
use Mojo::Base 'Mojolicious::Controller';

use DashboardApp::Model::Column;
use DashboardApp::Model::User;

sub show_dashboard {
    my $c = shift;

    my $columns = DashboardApp::Model::Column::load_columns( $c->session->{user_id}, 'lead_default_columns' );

    my $users = DashboardApp::Model::User::get_all_users();
    foreach my $user ( values %$users ) {
        delete( $user->{password} );
    }

    #####

    foreach my $column_id ( keys %$columns ) {
        my $column = $columns->{$column_id};
        next unless ( $column->{search_query} );

        my $tickets = $c->tickets_model->search_tickets( $column->{search_query} );
        my $error;
        #my $error = try {
        #    return;
        #} catch {
        #    return $_;
        #};

        $tickets = [ reverse( @$tickets ) ] if ( $column->{sort} and $column->{sort} eq "ticket_id_desc" );

        $column->{tickets} = $tickets;

        return $c->render( json => { error => $error } ) if ( $error );
    }

    ###

    $c->render(json => {
        columns => $columns,
        users => $users,
        rt_users => DashboardApp::Model::User::get_rt_users(),
        queues => $c->tickets_model->get_queues(),
        statuses => DashboardApp::Model::Config::get_rt_statuses()
    } );
}

sub save_columns {
    my $c = shift;

    my $json = $c->req->json;

    if ( ref( $json ) ne 'HASH' ) {
        return $c->render(json => { error => "Hash ref expected." });
    }

    my $tickets = DashboardApp::Model::Column::load_tickets();

    foreach my $user_id ( keys %$json ) {
        my $ticket_ids = $json->{$user_id};
        foreach my $ticket_id ( @$ticket_ids ) {
            $tickets->{$ticket_id}->{user_id} = $user_id;
            #$tickets->{$ticket_id}->{column_id} = undef;
        }
    }

    DashboardApp::Model::Column::dump_tickets( $tickets );

    $c->render(json => { status => "ok" });
}

1;
