package DashboardApp::Controller::Lead;
use Mojo::Base 'Mojolicious::Controller';

use DashboardApp::Model::Column;
use DashboardApp::Model::User;

sub show_dashboard {
    my $c = shift;

    my $columns = DashboardApp::Model::Column::load_columns( $c->session->{user_id}, 'lead_default_columns' );
    my $users = $c->app->model('user')->get_all_users();

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
        rt_users => $c->app->model('user')->get_rt_users(),
        queues => $c->tickets_model->get_queues(),
        statuses => DashboardApp::Model::Config::get_rt_statuses()
    } );
}

1;
