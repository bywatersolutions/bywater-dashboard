package DashboardApp::Controller::Lead;
use Mojo::Base 'Mojolicious::Controller';

use DashboardApp::Model::Column;

sub show_dashboard {
  my $c = shift;
  
  my %tickets;
  my %seen_tickets;
  my $columns = {
    'ticket_sql' => { name => "New tickets", type => "predefined", search_query => "Owner = 'Nobody' AND (  Status = 'new' OR Status = 'open' )", tickets => [], "order" => 0 },
    #2 => { name => "My tickets", search_query => "Owner = '__CurrentUser__' AND ( Status = 'new' OR Status = 'open')", tickets => [] },
  };
  
  my $users = DashboardApp::Model::User::get_all_users();
  
  #####
  
  #my $tickets = DashboardApp::Model::Column::load_tickets();
  #foreach my $ticket_id ( keys %$tickets ) {
  #  my $ticket_data = $tickets->{$ticket_id};
  #  
  #  next unless ( $columns->{ $ticket_data->{user_id} } );
  #  
  #  $seen_tickets{ $ticket_id } = 1;
  #  push( @{ $columns->{ $ticket_data->{user_id} }->{tickets} }, $ticket_id );
  #}
  
  #####
  
  foreach my $column_id ( keys %$columns ) {
    my $column = $columns->{$column_id};
    next unless ( $column->{search_query} );
    
    my $tickets = DashboardApp::Model::Ticket::search_tickets( $column->{search_query} );
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

sub save_columns {
  my $c = shift;
  
  my $json = $c->req->json;
  
  if ( ref( $json ) ne 'HASH' ) {
    return $c->render(json => { error => "Hash ref expected." });
  }
  
  my $tickets = DashboardApp::Model::Column::load_tickets();
  
  foreach my $user_id ( keys %$json ) {
    my $ticket_ids = $json->{$user_id};
    foreach my $ticket_id ( @$ticket_ids ) {
      $tickets->{$ticket_id}->{user_id} = $user_id;
      #$tickets->{$ticket_id}->{column_id} = undef;
    }
  }
  
  DashboardApp::Model::Column::dump_tickets( $tickets );
  
  $c->render(json => { status => "ok" });
}

1;