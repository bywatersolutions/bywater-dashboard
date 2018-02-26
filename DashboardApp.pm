package DashboardApp;
use Mojo::Base 'Mojolicious';

use DashboardApp::Schema;
use DashboardApp::Model::Config;
use DashboardApp::Model::Ticket;
use JSON qw/encode_json/;
use Mojolicious::Sessions::Storable;
use Plack::Session::Store::File;

my $schema;

sub startup {
    my $self = shift;

    $self->secrets(['eeQu6ighiegh6zaizoh6eithuiphoo']);

    #$self->plugin( 'Config' );
    $self->plugin( 'Model' );
    $self->plugin( 'tt_renderer' );
    $self->plugin( 'DashboardApp::Plugin::Memcached' => {
        memcached => {
            namespace => 'bws-dashboard',
            servers => [ 'localhost:11211' ],
        },
    } );
    push @{$self->static->paths}, $self->home->child('ui/build')->to_string;

    $self->helper( tickets_model => sub {
        my ( $c ) = @_;
        return DashboardApp::Model::Ticket->new( $self->app->memcached, $c->session->{rt_cookie} )
    } );

    $self->helper( schema => sub {
        my ( $c ) = @_;
        state $schema;
        unless ( $schema ) {
            my $config = DashboardApp::Model::Config::get_config();
            $schema = DashboardApp::Schema->connect( $config->{db}->{dsn}, $config->{db}->{username}, $config->{db}->{password} );
        }
        return $schema;
    } );

    my $config = DashboardApp::Model::Config::get_config();

    my $sessions = Mojolicious::Sessions::Storable->new(
        session_store => Plack::Session::Store::File->new( dir => './sessions' )
    );

    $self->sessions($sessions);

    my $r = $self->routes;
    $r->get("/")->to("main#index");
    $r->post("/json/login")->to("main#login");

    my $auth = $r->under( sub {
        my ( $c ) = @_;

        unless ( $c->session->{user_id} ) {
            $c->render( json => { error => "Not authorized." }, status => 401 );
            return 0;
        }

        return 1;
    } );

    $auth->get("/json/view/*id*")->to("view#get");
    $auth->post("/json/view/*id*")->to("view#update");

    $auth->post("/json/ticket/update")->to("main#update_ticket");
    $auth->post("/json/ticket/details")->to("main#ticket_details");
    $auth->post("/json/ticket/history")->to("main#ticket_history");
    $auth->post("/json/ticket/history_entries")->to("main#ticket_history_entries");
    $auth->post("/json/ticket/add_correspondence")->to("main#ticket_add_correspondence");
    $auth->post("/json/ticket/search")->to("main#ticket_search");

    $auth->post("/json/sugarcrm/get_contact")->to("main#sugarcrm_get_contact");
    $auth->post("/json/bugzilla/get_bug")->to("main#bugzilla_get_bug");

    $auth->post("/json/reports/get")->to("reports#get");
    $auth->post("/json/reports/get_data")->to("reports#get_data");

    $auth->get("/test")->to("test#test") if ( $config->{debug_backend} );

    $r->get("/logout")->to("main#logout");

    if ( $config->{debug_frontend} ) {
        $self->hook( after_static => sub {
            my $self = shift;

            $self->res->headers->cache_control('must-revalidate, no-store, no-cache, private');
        } );
    }

    # Catch any incorrect API routes
    $r->any( '/json/*fallback*', { fallback => '' }, sub {
        my $c = shift;

        $c->render( status => 404, json => { error => "/json/${ \$c->param('fallback') } not found" } );
    } );

    # Let the frontend handle any other routing.
    $r->any( '/*fallback*', { fallback => '' } )->to( 'main#index' );
}

1;
