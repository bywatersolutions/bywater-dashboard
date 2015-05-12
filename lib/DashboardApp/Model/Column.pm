package DashboardApp::Model::Column;

use Mojo::Base -strict;
use YAML qw/LoadFile DumpFile/;
use Storable qw/dclone/;

use DashboardApp::Model::Config;

# FIXME temporary file-based storage
sub load_columns {
  my ( $user_id, $config_param ) = @_;
  
  my $columns;
  unless ( $columns ) {
    my $config = DashboardApp::Model::Config::get_config();
    $columns = dclone( $config->{ $config_param } ) || {};
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