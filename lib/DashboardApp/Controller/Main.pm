package DashboardApp::Controller::Main;
use Mojo::Base 'Mojolicious::Controller';

use DashboardApp::Model::User;
use DashboardApp::Model::Ticket;
use Try::Tiny;

sub index {
  my $self = shift;
}

sub login {
  my $c = shift;
  
  my $json = $c->req->json;
  my $role;
  unless ( $role = DashboardApp::Model::User::check( $json->{login}, $json->{password} ) ) {
    return $c->render(json => { error => "Wrong login or password." });
  }
  
  $c->session({ user_id => $json->{login}, role => $role });
  $c->render(json => { role => $role });
}

sub get_role {
  my $c = shift;
  $c->render(json => { role => $c->session->{role} || "employee" });
}

sub update_ticket {
  my $c = shift;
  
  my $json = $c->req->json;
  
  my $ticket_id = $json->{ticket_id} || die "No ticket ID found!";
  my $params = {};
  
  if ( my $user_id = $json->{user_id} ) {
    my $users = DashboardApp::Model::User::get_all_users();
    if ( $users->{$user_id} and $users->{$user_id}->{rt_user_id} ) {
      $params->{owner} = $users->{$user_id}->{rt_user_id};
    } else {
      die "Unknown RT user!";
    }
  }
  
  DashboardApp::Model::Ticket::update_ticket( $ticket_id, $params );
  
  $c->render(json => { status => "ok" });
}

sub ticket_details {
  my $c = shift;
  
  my $json = $c->req->json;
  my $result = DashboardApp::Model::Ticket::get_tickets( $json->{ids} );
  
  $c->render( json => $result );
}

1;