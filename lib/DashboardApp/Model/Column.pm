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

1;
