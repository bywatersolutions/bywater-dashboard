package DashboardApp::Main;
use Mojo::Base 'Mojolicious::Controller';

use DashboardApp::Models::User;
use DashboardApp::Models::Ticket;
use Try::Tiny;

sub index {
  my $self = shift;
}

sub dashboard {
  my $c = shift;
  
  unless ( $c->session->{user_id} ) {
    return $c->render(json => { error => "You are not logged in!" });
  }
  
  ###
  
  my $credentials = DashboardApp::Models::User::get_rt_creds( $c->session->{user_id} );
  my %tickets;
  my $columns = {
    1 => { name => "New tickets", search_query => "Status = 'new'", tickets => [] },
    2 => { name => "My tickets", search_query => "Owner = '__CurrentUser__' AND ( Status = 'new' OR Status = 'open')", tickets => [] },
    3 => { name => "Custom column", search_query => "", tickets => [] },
    4 => { name => "Some other column", search_query => "", tickets => [] },
  };
  
  ###
  
  # Fetching tickets from RT
  
  foreach my $column_id ( keys %$columns ) {
    my $column = $columns->{$column_id};
    next unless ( $column->{search_query} );
    
    my $tickets;
    my $error = try {
      $tickets = DashboardApp::Models::Ticket::get_tickets( $credentials, $column->{search_query} );
      return;
    } catch {
      return $_;    
    };
    
    $column->{tickets} = [ keys %$tickets ];
    
    %tickets = ( %tickets, %$tickets );
    
    return $c->render( json => { error => $error } ) if ( $error );
  }
  
  ###
  
  $c->render(json => {
    status => "ok",
    tickets => \%tickets,
    columns => $columns
  });
}

sub login {
  my $c = shift;
  
  my $json = $c->req->json;
  
  unless ( DashboardApp::Models::User::check( $json->{login}, $json->{password} ) ) {
    return $c->render(json => { error => "Wrong login or password." });
  }
  
  $c->session({ user_id => $json->{login} });
  
  $c->render(json => { status => "ok" });
}

1;