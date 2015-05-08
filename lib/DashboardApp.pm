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
  $r->post("/json/login")->to("main#login");
  
  my $auth = $r->under( sub {
    my ( $c ) = @_;
    
    unless ( $c->session->{user_id} ) {
      $c->render( json => { error => "Not authorized." }, status => 401 );
      return 0;
    }
    
    return 1;
  } );
  
  $auth->get("/json/employee/tickets")->to("employee#show_dashboard");
  $auth->post("/json/employee/save_columns")->to("employee#save_columns");
  
  $auth->get("/json/get_role")->to("main#get_role");
  $auth->post("/json/update_ticket")->to("main#update_ticket");
  $auth->post("/json/ticket_details")->to("main#ticket_details");
  
  my $lead = $auth->under( sub {
    my ( $c ) = @_;
    
    unless ( $c->session->{role} eq "lead" ) {
      $c->render( json => { error => "Operation not permitted." }, status => 403 );
      return 0;
    }
    
    return 1;
  } );
  
  $lead->get("/json/lead/tickets")->to("lead#show_dashboard");
  $lead->post("/json/lead/save_columns")->to("lead#save_columns");
}
  

1;