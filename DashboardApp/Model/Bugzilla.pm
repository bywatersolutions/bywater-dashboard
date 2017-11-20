package DashboardApp::Model::Bugzilla;

use Mojo::Base -strict;
use DashboardApp::Model::Config;

use BZ::Client;
use BZ::Client::Bug;

my $api;

sub new {
	my ( $class ) = @_;
    return bless( {}, $class );
}

sub _api {
	unless ( $api ) {
		my $config = DashboardApp::Model::Config::get_config();
		die "Bugzilla configuration not found." unless ( $config->{bugzilla} );
		
		$api = BZ::Client->new( url => $config->{bugzilla}->{url}, api_key => $config->{bugzilla}->{api_key}, autologin => 0 );
	}

	return $api;
}

sub get_bugs {
	my ( $self, $bug_ids ) = @_;
	
	die "Arrayref expected." unless ( ref( $bug_ids ) eq "ARRAY" );
	die "Empty bug_ids array." unless ( scalar( @$bug_ids ) );

	my $config = DashboardApp::Model::Config::get_config();
	my $bugs = BZ::Client::Bug->get( $self->_api(), $bug_ids );
	
	my $result = {};
	foreach my $bug ( @$bugs ) {
		my $item = { comments => [] };
		
		foreach my $field ( qw/id alias assigned_to component creation_time dupe_of is_open last_change_time priority product resolution severity status summary/ ) {
			$item->{$field}	= $bug->$field();
			if ( ref( $item->{$field} ) eq "DateTime" ) {
				$item->{$field} = $item->{$field}->strftime('%Y-%m-%d %H:%M:%S')
			}
		}
		
		$item->{link} = $config->{bugzilla}->{url} . "show_bug.cgi?id=" . $bug->id();
		
		$result->{ $bug->id() } = $item;
	}
	
	my $response = $self->_api()->api_call( 'Bug.comments', { ids => $bug_ids } );
	foreach my $bug_id ( keys %{ $response->{bugs} } ) {
		foreach my $comment ( @{ $response->{bugs}->{ $bug_id }->{comments} } ) {
			foreach my $field ( keys %$comment ) {
				if ( ref( $comment->{$field} ) eq "DateTime" ) {
					$comment->{$field} = $comment->{$field}->strftime('%Y-%m-%d %H:%M:%S')
				}
			}
			
			push( @{ $result->{$bug_id}->{comments} }, $comment );
		}
	}

	return $result;
}

1;
