package DashboardApp::Model::Config;

use Mojo::Base -strict;
use YAML qw/LoadFile/;
use Hash::Merge qw/merge/;
use Data::Dumper;

my $config;

sub get_config {
	unless ( $config ) {
		$config = LoadFile("config/config.yaml");
		if ( -f "config/config.local.yaml" && -r "config/config.local.yaml" ) {
			my $local_config = LoadFile("config/config.local.yaml");
			$config = merge( $local_config, $config );
		}
	}
	return $config;
}

sub get_rt_statuses {
	my $config = get_config();
	return $config->{rt}->{statuses};
}

1;
