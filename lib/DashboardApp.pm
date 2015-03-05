package DashboardApp;
use Mojo::Base 'Mojolicious';

use JSON qw/encode_json/;
use Mojolicious::Sessions::Storable;
use Plack::Session::Store::File;

sub startup {
  my $self = shift;
  
  $self->secrets(['eeQu6ighiegh6zaizoh6eithuiphoo']);
  
  $self->plugin('tt_renderer');
  #$self->plugin( WWWSession => { storage => [File => {path => './sessions'}], autosave => 1 } );
  
  my $sessions = Mojolicious::Sessions::Storable->new(
      session_store => Plack::Session::Store::File->new( dir => './sessions' )
  );
   
  $self->sessions($sessions);
  
  my $r = $self->routes;
  $r->get("/")->to("main#index");
  $r->get("/main/dashboard")->to("main#dashboard");
  $r->post("/main/login")->to("main#login");
}

1;