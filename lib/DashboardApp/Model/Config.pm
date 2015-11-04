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
			Hash::Merge::specify_behavior(
				{
					'SCALAR' => {
						'SCALAR' => sub { $_[1] },
						'ARRAY'  => sub { [ $_[0], @{ $_[1] } ] },
						'HASH'   => sub { $_[1] },
					},
					'ARRAY' => {
						'SCALAR' => sub { $_[1] },
						'ARRAY'  => sub { [ @{ $_[1] } ] },
						'HASH'   => sub { $_[1] },
					},
					'HASH' => {
						'SCALAR' => sub { $_[1] },
						'ARRAY'  => sub { [ values %{ $_[0] }, @{ $_[1] } ] },
						'HASH'   => sub { Hash::Merge::_merge_hashes( $_[0], $_[1] ) },
					},
				},
				"Config Merge Behaviour"
			);
			$config = merge( $config, $local_config );
		}
	}
	return $config;
}

sub get_rt_statuses {
	my $config = get_config();
	return $config->{rt}->{statuses};
}

1;
