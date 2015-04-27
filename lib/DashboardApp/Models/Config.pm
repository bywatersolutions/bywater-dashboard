package DashboardApp::Models::Config;

use strict;
use warnings;
use YAML qw/LoadFile/;
use Data::Dumper;

my $config = LoadFile("config.yaml");

sub get_config {
    return $config;    
}