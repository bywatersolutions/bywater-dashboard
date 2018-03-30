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
        %{ $c->session->{user_info} },

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

    unless ( $user ) {
        $c->res->code( 400 );
        return $c->render(json => { error => "Wrong login or password." });
    }

    my $rt = DashboardApp::Model::Ticket->new->rt;
    $rt->login( username => $json->{login}, password => $json->{password} );

    my $rt_cookie = JSON->new->encode( { COOKIES => $rt->_cookie->{COOKIES} } );
    $c->session({
        user_id => $user->user_id,
        user_info => { $user->get_columns },
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
