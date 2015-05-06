package DashboardApp;
use Mojo::Base 'Mojolicious';

use JSON qw/encode_json/;
use Mojolicious::Sessions::Storable;
use Plack::Session::Store::File;

sub startup {
  my $self = shift;
  
  $self->secrets(['eeQu6ighiegh6zaizoh6eithuiphoo']);
  
  $self->plugin('tt_renderer');
  
  my $sessions = Mojolicious::Sessions::Storable->new(
      session_store => Plack::Session::Store::File->new( dir => './sessions' )
  );
   
  $self->sessions($sessions);
  
  my $r = $self->routes;
  $r->get("/")->to("main#index");
  $r->get("/main/get_role")->to("main#get_role");
  $r->post("/main/login")->to("main#login");
  $r->post("/main/update_ticket")->to("main#update_ticket");
  
  $r->get("/main/employee_tickets")->to("employee#show_dashboard");
  $r->post("/main/employee_save_columns")->to("employee#save_columns");
  
  $r->get("/main/lead_tickets")->to("lead#show_dashboard");
  $r->post("/main/lead_save_columns")->to("lead#save_columns");
}
  

1;