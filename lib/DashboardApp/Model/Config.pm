package DashboardApp::Model::Config;

use Mojo::Base -strict;
use YAML qw/LoadFile/;
use Data::Dumper;

my $config;

sub get_config {
    $config = LoadFile("config.yaml") unless ( $config );
    return $config;    
}

1;