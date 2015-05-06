package DashboardApp::Model::Column;

use Mojo::Base -strict;
use YAML qw/LoadFile DumpFile/;

use DashboardApp::Model::Config;

# FIXME temporary file-based storage
sub load_columns {
  my ( $user_id ) = @_;
  
  my $columns;
  
  # FIXME temporarily disabled
  #if ( -f "columns.yaml" ) {
  #  my $data = LoadFile("columns.yaml") ;
  #  $columns = $data->{$user_id};
  #}
  
  unless ( $columns ) {
    my $config = DashboardApp::Model::Config::get_config();
    use Storable qw/dclone/; # FIXME a bit of a hack
    $columns = dclone( $config->{default_columns} ) || {};
  }
  
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