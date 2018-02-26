package DashboardApp::Controller::Main;
use Mojo::Base 'Mojolicious::Controller';

use DashboardApp::Model::User;
use DashboardApp::Model::Ticket;
use DashboardApp::Model::SugarCRM;
use DashboardApp::Model::Bugzilla;
use Text::Quoted;
use Try::Tiny;
use Mojo::Exception;
use Mojo::JSON qw( encode_json );

sub _get_user_info {
    my $c = shift;
    my $config = DashboardApp::Model::Config::get_config();

    return undef unless ( $c->session && $c->session->{user_id} );

    return {
        user_id => $c->session->{user_id},
        username => $c->session->{rt_username},
        first_name => $c->session->{first_name},
        last_name => $c->session->{last_name},

        custom_fields => $config->{rt}->{custom_fields} || [],
        popup_config => $config->{card_popup},
        queues => $c->tickets_model->get_queues(),
        statuses => DashboardApp::Model::Config::get_rt_statuses(),
        users => $c->app->model('user')->get_all_users(),
        views => $c->app->model('user')->get_views( $c->sessions->{user_id} ),
    };
}

sub index {
    my $c = shift;
    my $config = DashboardApp::Model::Config::get_config();

    my $user_info = _get_user_info( $c );

    if ( $user_info && !$c->tickets_model->ping() ) {
        $user_info = undef;
    }

    $c->stash( debug_frontend => $config->{debug_frontend}, user_info => encode_json( $user_info ) );
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
    $c->session({
        user_id => $user->user_id,
        first_name => $user->first_name,
        last_name => $user->last_name,
        roles => \@roles,
        rt_username => $json->{login},
        rt_cookie => $rt_cookie,
    });

    # Default view for a user will be the first role defined
    $c->render(json => {
        role => $roles[0],
        user_info => _get_user_info( $c ),
    });
}

sub logout {
        my $c = shift;

        $c->session( expires => 1 );

        $c->redirect_to('/');
}

sub update_ticket {
    my $c = shift;

    my $json = $c->req->json;

    my $ticket_id = $json->{ticket_id} || die "No ticket ID found!";
    my $params = {};

    if ( my $user_id = $json->{user_id} ) {
        # Checking that user exists
        my $user = $c->schema->resultset('User')->search({ rt_username => $user_id })->first;
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

    $c->render( json => $result );
}

sub ticket_history_entries {
    my $c = shift;

    my $json = $c->req->json;
    my $result = $c->tickets_model->get_history_entries( $json->{ticket_id}, $json->{history_ids} );

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

sub ticket_search {
    my $c = shift;

    my $json = $c->req->json;
    
    my $ids = $c->tickets_model->search_tickets( $json->{query} );
    my $result = $c->tickets_model->get_tickets( $ids );

    $c->render( json => $result );
}

sub sugarcrm_get_contact {
    my $c = shift;

    my $json = $c->req->json;
    my $sugar = DashboardApp::Model::SugarCRM->new();

    my $data = $sugar->get_contact( $json->{email} );

    $c->render( json => $data );
}

sub bugzilla_get_bug {
    my $c = shift;
    
    my $json = $c->req->json;
    my $data;
    try {
        $data = DashboardApp::Model::Bugzilla->new()->get_bugs( $json->{bug_ids} );
    } catch {
        $data = { error => $_->message() }
    };
    
    $c->render( json => $data );
}

1;
