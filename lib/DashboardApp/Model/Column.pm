package DashboardApp::Model::Column;

use Mojo::Base -strict;
use YAML qw/LoadFile DumpFile/;

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

1;