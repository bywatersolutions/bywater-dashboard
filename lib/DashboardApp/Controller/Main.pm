package DashboardApp::Controller::Main;
use Mojo::Base 'Mojolicious::Controller';

use DashboardApp::Model::User;
use DashboardApp::Model::Ticket;
use DashboardApp::Model::SugarCRM;
use Text::Quoted;
use Try::Tiny;
use Mojo::Exception;

sub index {
    my $c = shift;
    my $config = DashboardApp::Model::Config::get_config();

    $c->stash( debug_frontend => $config->{debug_frontend} );
}

sub login {
    my $c = shift;

    my $json = $c->req->json;
    my $roles;

    my $user = $c->schema->resultset('User')->search({ rt_username => $json->{login} })->first;

    return $c->render(json => { error => "Wrong login or password." }) unless ( $user );

    my @roles;
    foreach my $role ( $user->user_roles ) {
        push( @roles, $role->role );
    }

    return $c->render(json => { error => "No roles defined." }) unless ( @roles );

    my $rt = DashboardApp::Model::Ticket->new->rt;
    $rt->login( username => $json->{login}, password => $json->{password} );

    my $rt_cookie = JSON->new->encode( { COOKIES => $rt->_cookie->{COOKIES} } );
    $c->session({ user_id => $user->user_id, roles => \@roles, rt_cookie => $rt_cookie });

    # Default view for a user will be the first role defined
    $c->render(json => { role => $roles[0] });
}

sub logout {
        my $c = shift;

        $c->session( expires => 1 );

        $c->redirect_to('/');
}

sub get_roles {
    my $c = shift;
    $c->render(json => { roles => $c->session->{roles} });
}

sub update_ticket {
    my $c = shift;

    my $json = $c->req->json;

    my $ticket_id = $json->{ticket_id} || die "No ticket ID found!";
    my $params = {};

    if ( my $user_id = $json->{user_id} ) {
        my $user = $c->schema->search({ rt_username => $user_id })->first;
        if ( $user ) {
            $params->{owner} = $user_id;
        } else {
            die "Unknown RT user!";
        }
    } else {
        foreach my $param ( qw/Owner Status Queue/ ) {
            $params->{ $param } = $json->{ $param } if ( defined $json->{ $param } );
        }
    }

    $c->tickets_model->update_ticket( $ticket_id, $params );

    $c->render(json => { status => "ok" });
}

sub ticket_details {
    my $c = shift;

    my $json = $c->req->json;
    my $result = $c->tickets_model->get_tickets( $json->{ids} );

    $c->render( json => $result );
}

sub ticket_history {
    my $c = shift;

    my $json = $c->req->json;
    my $result = $c->tickets_model->get_history( $json->{ticket_id} );

    Text::Quoted::set_quote_characters( undef );

    my $sub;
    $sub = sub {
        my $data = $_[0];

        my @result = ();
        foreach my $item ( @$data ) {
            if ( ref($item) eq "HASH" ) {
                next if ( $item->{empty} );
                push( @result, $item->{text} );
            } else {
                push( @result, &$sub( $item ) );
            }
        }

        return \@result;
    };

    foreach my $item ( @$result ) {
        $item->{Content} = &$sub( extract( $item->{Content} ) );
    }

    $c->render( json => $result );
}

sub ticket_add_correspondence {
    my $c = shift;
    my $json = $c->req->json;

    if ( $json->{privacy} eq "public" ) {
        $c->tickets_model->rt->correspond( ticket_id => $json->{ticket_id}, message => $json->{message} );
    } else {
        $c->tickets_model->rt->comment( ticket_id => $json->{ticket_id}, message => $json->{message} );
    }

    $c->render( json => { status => "ok" } );
}

sub sugarcrm_get_contact {
    my $c = shift;

    my $json = $c->req->json;
    my $sugar = DashboardApp::Model::SugarCRM->new();

    my $data = $sugar->get_contact( $json->{email} );

    $c->render( json => $data );
}

sub view_save_settings {
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
