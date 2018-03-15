package DashboardApp::Controller::Main;
use Mojo::Base 'Mojolicious::Controller';

use DashboardApp::Model::User;
use DashboardApp::Model::Ticket;
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
        users => $c->app->model('User')->get_all_users(),
        views => $c->app->model('User')->get_views( $c->session->{user_id} ),
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

    my $rt = DashboardApp::Model::Ticket->new->rt;
    $rt->login( username => $json->{login}, password => $json->{password} );

    my $rt_cookie = JSON->new->encode( { COOKIES => $rt->_cookie->{COOKIES} } );
    $c->session({
        user_id => $user->user_id,
        first_name => $user->first_name,
        last_name => $user->last_name,
        rt_username => $json->{login},
        rt_cookie => $rt_cookie,
    });

    # Default view for a user will be the first role defined
    $c->render(json => {
        user_info => _get_user_info( $c ),
    });
}

sub logout {
        my $c = shift;

        $c->session( expires => 1 );

        $c->redirect_to('/');
}

1;
