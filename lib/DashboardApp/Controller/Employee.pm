package DashboardApp::Controller::Employee;
use Mojo::Base 'Mojolicious::Controller';

use DashboardApp::Model::Column;

sub show_dashboard {
  my $c = shift;
  
  unless ( $c->session->{user_id} ) {
    return $c->render(json => { error => "You are not logged in!" });
  }
  
  ###
  
  my %tickets;
  my $columns = DashboardApp::Model::Column::load_columns( $c->session->{user_id} );
  
  ###
  
  my $tickets = DashboardApp::Model::Column::load_tickets();
  
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
      $tickets = DashboardApp::Model::Ticket::get_tickets( $column->{tickets} );
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

sub save_columns {
  my $c = shift;
  
  unless ( $c->session->{user_id} ) {
    return $c->render(json => { error => "You are not logged in!" });
  }
  
  my $json = $c->req->json;
  
  if ( ref( $json ) ne 'HASH' ) {
    return $c->render(json => { error => "Hash ref expected." });
  }
  
  my $tickets = DashboardApp::Model::Column::load_tickets();
  
  foreach my $column_id ( keys %$json ) {
    my $ticket_ids = $json->{$column_id};
    foreach my $ticket_id ( @$ticket_ids ) {
      # FIXME user_id check
      $tickets->{$ticket_id}->{column_id} = $column_id;
    }
  }
  
  DashboardApp::Model::Column::dump_tickets( $tickets );
  
  $c->render(json => { status => "ok" });
}

1;