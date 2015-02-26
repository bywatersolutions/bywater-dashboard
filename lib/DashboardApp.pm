package DashboardApp;
use Mojo::Base 'Mojolicious';

use JSON qw/encode_json/;

sub startup {
  my $self = shift;
  
  $self->secrets(['eeQu6ighiegh6zaizoh6eithuiphoo']);
  
  $self->plugin('tt_renderer');
  $self->plugin( WWWSession => { storage => [File => {path => './sessions'}] } );
  
  my $r = $self->routes;
  $r->get("/")->to("main#index");
  $r->get("/main/dashboard")->to("main#dashboard");
  $r->post("/main/login")->to("main#login");
}

1;