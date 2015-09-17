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
    my %seen_tickets;
    my $columns = DashboardApp::Model::Column::load_columns( $c->session->{user_id}, 'employee_default_columns' );

    ###

    my $tickets = DashboardApp::Model::Column::load_tickets();

    foreach my $ticket_id ( keys %$tickets ) {
        my $ticket_data = $tickets->{ $ticket_id };

        if ( $ticket_data->{column_id} && $columns->{ $ticket_data->{column_id} } ) {
            push( @{ $columns->{ $ticket_data->{column_id} }->{tickets} }, $ticket_id );
            $seen_tickets{ $ticket_id } = 1;
        }
    }

    #####

    # FIXME fetch list of all opened tickets assigned to user and filter stuff here.
    #foreach my $column ( values %$columns ) {
    #    $column->{tickets} = [ grep { $tickets{ $_ } } @{ $column->{tickets} } ];
    #}

    #####

    # Fetching tickets from RT
    foreach my $column_id ( keys %$columns ) {
        my $column = $columns->{$column_id};
        next unless ( $column->{type} eq "rt" and $column->{search_query} );

        my $query = $column->{search_query};
        my $users = DashboardApp::Model::User::get_all_users();
        my $user_id = $users->{ $c->session->{user_id} }->{rt_user_id} or die "rt_user_id is not specified for user " . $c->session->{user_id};
        $query =~ s/__CurrentUser__/$user_id/g;

        my $tickets = $c->tickets_model->search_tickets( $query );
        $tickets = [ reverse( @$tickets ) ] if ( $column->{sort} and $column->{sort} eq "ticket_id_desc" );

        my $error = "";

        $column->{tickets} = [];
        foreach my $ticket_id ( @$tickets ) {
            next if ( $seen_tickets{ $ticket_id } );
            push( @{ $column->{tickets} }, $ticket_id );
        }

        return $c->render( json => { error => $error } ) if ( $error );
    }

    ###

    $c->render( json => {
        columns => $columns,
        queues => $c->tickets_model->get_queues(),
        statuses => DashboardApp::Model::Config::get_rt_statuses(),
        rt_users => DashboardApp::Model::User::get_rt_users()
    } );
}

sub save_columns {
    my $c = shift;

    my $json = $c->req->json;

    if ( ref( $json ) ne 'HASH' ) {
        return $c->render(json => { error => "Hash ref expected." });
    }

    my $tickets = DashboardApp::Model::Column::load_tickets();

    foreach my $column_id ( keys %$json ) {
        my $ticket_ids = $json->{$column_id};
        foreach my $ticket_id ( @$ticket_ids ) {
            # FIXME user_id check
            $tickets->{$ticket_id}->{column_id} = $column_id;
        }
    }

    DashboardApp::Model::Column::dump_tickets( $tickets );

    $c->render(json => { status => "ok" });
}

1;
