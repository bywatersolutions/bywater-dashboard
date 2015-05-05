package DashboardApp::Main;
use Mojo::Base 'Mojolicious::Controller';

use DashboardApp::Models::User;
use DashboardApp::Models::Ticket;
use Try::Tiny;
use YAML qw/LoadFile DumpFile/;

sub index {
  my $self = shift;
}

# FIXME temporary file-based storage
sub load_columns {
  my ( $user_id ) = @_;
  
  return {} unless ( -f "columns.yaml" );
  
  my $data = LoadFile("columns.yaml") ;
  my $columns = $data->{$user_id};
  
  $columns->{incoming} = { name => "Incoming", "order" => 0 };
  return $columns;
}

sub load_tickets {
  return {} unless ( -f "tickets.yaml" );
  return LoadFile("tickets.yaml");
}

sub dump_tickets {
  my ( $tickets ) = @_;
  DumpFile("tickets.yaml", $tickets);  
}

sub lead_tickets {
  my $c = shift;
  
  unless ( $c->session->{user_id} ) {
    return $c->render(json => { error => "You are not logged in!" });
  }
  
  my %tickets;
  my %seen_tickets;
  my $columns = {
    'ticket_sql' => { name => "New tickets", type => "predefined", search_query => "Owner = 'Nobody' AND (  Status = 'new' OR Status = 'open' )", tickets => [], "order" => 0 },
    #2 => { name => "My tickets", search_query => "Owner = '__CurrentUser__' AND ( Status = 'new' OR Status = 'open')", tickets => [] },
  };
  
  my $users = DashboardApp::Models::User::get_all_users();
  
  #####
  
  my $tickets = load_tickets();
  foreach my $ticket_id ( keys %$tickets ) {
    my $ticket_data = $tickets->{$ticket_id};
    
    next unless ( $columns->{ $ticket_data->{user_id} } );
    
    $seen_tickets{ $ticket_id } = 1;
    push( @{ $columns->{ $ticket_data->{user_id} }->{tickets} }, $ticket_id );
  }
  
  #####
  
  foreach my $column_id ( keys %$columns ) {
    my $column = $columns->{$column_id};
    next unless ( $column->{search_query} );
    
    my $tickets = DashboardApp::Models::Ticket::search_tickets( $column->{search_query} );
    my $error;
    #my $error = try {
    #  return;
    #} catch {
    #  return $_;    
    #};
    
    $column->{tickets} = [];
    foreach my $ticket_id ( keys %$tickets ) {
      next if ( $seen_tickets{ $ticket_id } );
      push( @{ $column->{tickets} }, $ticket_id );
    }
    
    %tickets = ( %tickets, %$tickets );
    
    return $c->render( json => { error => $error } ) if ( $error );
  }
  
  ###
  
  $c->render(json => {
    status => "ok",
    tickets => \%tickets,
    columns => $columns,
    users => $users
  });
  
}

sub employee_tickets {
  my $c = shift;
  
  unless ( $c->session->{user_id} ) {
    return $c->render(json => { error => "You are not logged in!" });
  }
  
  ###
  
  my %tickets;
  my $columns = load_columns( $c->session->{user_id} );
  
  ###
  
  my $tickets = load_tickets();
  
  foreach my $ticket_id ( keys %$tickets ) {
    my $ticket_data = $tickets->{ $ticket_id };
    next unless ( $ticket_data->{user_id} eq $c->session->{user_id} );
    
    if ( $ticket_data->{column_id} && $columns->{ $ticket_data->{column_id} } ) {
      push( @{ $columns->{ $ticket_data->{column_id} }->{tickets} }, $ticket_id );
    } else {
      push( @{ $columns->{incoming}->{tickets} }, $ticket_id );
    }
    
  }
  
  # Fetching tickets from RT
  foreach my $column_id ( keys %$columns ) {
    my $column = $columns->{$column_id};
    
    my $tickets;
    #my $error = try {
      $tickets = DashboardApp::Models::Ticket::get_tickets( $column->{tickets} );
      #return;
    #} catch {
    #  return $_;    
    #};
    
    my $error = "";
    
    $column->{tickets} = [];
    foreach my $ticket_id ( keys %$tickets ) {
      #next if ( $seen_tickets{ $ticket_id } );
      push( @{ $column->{tickets} }, $ticket_id );
      #$seen_tickets{ $ticket_id } = 1;
    }
    
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
  my $role;
  unless ( $role = DashboardApp::Models::User::check( $json->{login}, $json->{password} ) ) {
    return $c->render(json => { error => "Wrong login or password." });
  }
  
  $c->session({ user_id => $json->{login}, role => $role });
  
  $c->render(json => { status => "ok" });
}

sub employee_save_columns {
  my $c = shift;
  
  unless ( $c->session->{user_id} ) {
    return $c->render(json => { error => "You are not logged in!" });
  }
  
  my $json = $c->req->json;
  
  if ( ref( $json ) ne 'HASH' ) {
    return $c->render(json => { error => "Hash ref expected." });
  }
  
  my $tickets = load_tickets();
  
  foreach my $column_id ( keys %$json ) {
    my $ticket_ids = $json->{$column_id};
    foreach my $ticket_id ( @$ticket_ids ) {
      # FIXME user_id check
      $tickets->{$ticket_id}->{column_id} = $column_id;
    }
  }
  
  dump_tickets( $tickets );
  
  $c->render(json => { status => "ok" });
}

sub lead_save_columns {
  my $c = shift;
  
  unless ( $c->session->{user_id} ) {
    return $c->render(json => { error => "You are not logged in!" });
  }
  
  my $json = $c->req->json;
  
  if ( ref( $json ) ne 'HASH' ) {
    return $c->render(json => { error => "Hash ref expected." });
  }
  
  my $tickets = load_tickets();
  
  foreach my $user_id ( keys %$json ) {
    my $ticket_ids = $json->{$user_id};
    foreach my $ticket_id ( @$ticket_ids ) {
      $tickets->{$ticket_id}->{user_id} = $user_id;
      #$tickets->{$ticket_id}->{column_id} = undef;
    }
  }
  
  dump_tickets( $tickets );
  
  $c->render(json => { status => "ok" });
}

sub get_role {
  my $c = shift;
  $c->render(json => { role => $c->session->{role} || "employee" });
}

1;