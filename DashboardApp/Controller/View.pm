package DashboardApp::Controller::View;
use Mojo::Base 'Mojolicious::Controller';

use DashboardApp::Model::User;
use DashboardApp::Model::Ticket;
use DashboardApp::Model::Config;

sub get {
    my $c = shift;

    my ( $view_id, $columns ) = $c->model('View')->get( $c->session->{user_id}, $c->param('id'), $c->tickets_model );

    $c->render( json => {
        view_id => $view_id,
        columns => $columns,
    } );
}

sub update {
    my $c = shift;

    my $json = $c->req->json;

    $c->app->schema->txn_do( sub {
        for my $view_data ( @{ $json->{views} } ) {
            my $view_params = { map { $_ => $view_data->{$_} } qw/name extra/ };
            $view_params->{user_id} = $c->session->{user_id};
            my $view;

            if ( $view_data->{view_id} ) {
                $view = $c->app->schema->resultset('View')->find( $view_data->{view_id} );

                Mojo::Exception->throw('No such view') unless ( $view );
                Mojo::Exception->throw('Security violation') unless ( $view->user_id == $c->session->{user_id} );

                $view->update( $view_params );
            } else {
                $view = $c->app->schema->resultset('View')->create( $view_params );
                $view_data->{view_id} = $view->view_id;
            }

            my $db_columns = {};
            foreach my $column ( $view->columns->all ) {
                $db_columns->{ $column->column_id } = $column;
            }

            # Updating columns
            my $idx = 0;
            foreach my $column ( @{ $view_data->{columns} } ) {
                $column->{column_order} = $idx++;
                my $params = { map { $_ => $column->{$_} } qw/rt_query column_sort column_order name type/ };
                $params->{view_id} = $view->view_id;

                unless ( $column->{column_id} ) {
                    my $db_column = $c->app->schema->resultset('Column')->create( $params );
                    $column->{column_id} = $db_column->column_id;
                } else {
                    if ( my $db_column = $db_columns->{ $column->{column_id} } ) {
                        $db_column->update( $params );
                        delete( $db_columns->{ $column->{column_id} } );
                    }
                }
            }

            # Deleting columns that weren't in JSON from the front-end
            foreach my $db_column ( values %$db_columns ) {
                $db_column->delete;
            }
        }
    } );

    $c->render( json => $json );
}

sub get_column_results {
    my $c = shift;

    my $result = {};
    my $tickets_model = $c->tickets_model;
    
    foreach my $column_id ( split /,/, $c->param( 'ids' ) ) {
        $result->{ $column_id } = $c->model('View')->fetch_column_results( $column_id, $tickets_model );
    }

    $c->render( json => $result );
}

1;
