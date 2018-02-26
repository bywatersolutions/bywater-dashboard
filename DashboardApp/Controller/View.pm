package DashboardApp::Controller::View;
use Mojo::Base 'Mojolicious::Controller';

use DashboardApp::Model::User;
use DashboardApp::Model::Ticket;
use DashboardApp::Model::Config;

sub get {
    my $c = shift;

    my ( $view_id, $columns ) = $c->model('View')->get( $c->session->{user_id}, $c->tickets_model, $c->param('id') );

    $c->render( json => {
        view_id => $view_id,
        columns => $columns,
    } );
}

sub update {
    my $c = shift;

    my $json = $c->req->json;
    my $view = $c->app->schema->resultset('View')->find( $json->{view_id} );

    Mojo::Exception->throw('No such view') unless ( $view );
    Mojo::Exception->throw('Security violation') unless ( $view->role->user_id == $c->session->{user_id} );

    my $db_columns = {};
    foreach my $column ( $view->columns_rel->all ) {
        $db_columns->{ $column->column_id } = $column;
    }

    # Updating columns
    my $idx = 0;
    foreach my $column ( @{ $json->{columns} } ) {
        $column->{column_order} = $idx++;
        my $params = { map { $_ => $column->{$_} } qw/rt_query column_sort column_order name type/ };
        $params->{view_id} = $view->view_id;

        unless ( $column->{column_id} ) {
            $c->app->schema->resultset('Column')->create( $params );
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

    $c->render( json => $c->req->json );
}

1;
