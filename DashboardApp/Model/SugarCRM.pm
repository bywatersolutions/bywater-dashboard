package DashboardApp::Model::SugarCRM;

use Mojo::Base -strict;
use Net::SugarCRM;
use DashboardApp::Model::Config;
use Digest::MD5 qw/md5_hex/;

use IO::Socket::SSL; # qw(debug3);
use Net::SSLeay;

my $api;

my $labels;

sub new {
	my ( $class ) = @_;
    return bless( {}, $class );
}

sub _api {
	unless ( $api ) {
		my $config = DashboardApp::Model::Config::get_config();
		die "SugarCRM configuration not found." unless ( $config->{sugar_crm} );

		$api = Net::SugarCRM->new(
			url        => $config->{sugar_crm}->{api_url},
			restuser   => $config->{sugar_crm}->{login},
			restpasswd => md5_hex( $config->{sugar_crm}->{password} ),
		);

		if ( $config->{sugar_crm}->{ignore_ssl_errors} ) {
			IO::Socket::SSL::set_ctx_defaults( verify_mode => Net::SSLeay->VERIFY_NONE() );
			$api->globalua()->ssl_opts( verify_hostname => 0 );
		}
        $api->globalua()->env_proxy;
	}

	return $api;
}

# TODO add memcached caching?
sub _field_labels {
	my ( $self ) = @_;

	unless ( $labels ) {
		$labels = {};

		my $config = DashboardApp::Model::Config::get_config();

		foreach my $module_name ( keys %{ $config->{sugar_crm}->{fields} } ) {
			my $result = $self->_api()->get_module_fields( $module_name );

			foreach my $field_id ( keys %{ $result->{module_fields} } ) {
			    $labels->{ $module_name }->{ $field_id } = $result->{module_fields}->{ $field_id }->{label};
			    $labels->{ $module_name }->{ $field_id } =~ s/:\s*$//;
			}
		}
	}

	return $labels;
}

# Net::SugarCRM uses get_entry_list method rather than get_entries method, which SugarCRM does not allow for Systems module.
sub get_one_entry {
	my ( $self, $module, $id ) = @_;

	# Net::SugarCRM encodes JSON manually for some reason, copypasta from there. :-)
    my $rest_data = '{"session": "'.$self->_api()->sessionid.'", "module_name": "' . $module . '", "ids": [ "' . $id . '" ] }';

	my $response = $self->_api()->_rest_request('get_entries', $rest_data);

	return if ( defined $response->{total_count} and $response->{total_count} == 0 );
    return Net::SugarCRM::Entry->new( $response->{entry_list}->[0] );
}

sub get_contact {
	my ( $self, $email, $skip_systems ) = @_;
	my $contacts = $self->_api()->get_contacts_from_mail( $email );

	my $config = DashboardApp::Model::Config::get_config();

	my @result;
	my $account_id;
	if ( $contacts ) {
		foreach my $contact ( @$contacts ) {
			my $item = {};

			$account_id = $contact->account_id() if ( $contact->account_id() );

			foreach my $field ( @{ $config->{sugar_crm}->{fields}->{Contacts} } ) {
				$item->{$field} = $contact->$field() if ( $contact->has( $field ) );
			}
			push( @result, $item );
		}
	}

	my $system = {};
	if ( $account_id && !$skip_systems ) {
		my @system_ids = @{ $self->_api()->get_module_link_ids("Accounts", "sys_systems_accounts", $account_id ) };

		if ( @system_ids ) {
			my $result = $self->get_one_entry( "SYS_Systems", shift( @system_ids ) );
			foreach my $field ( @{ $config->{sugar_crm}->{fields}->{SYS_Systems} } ) {
				$system->{$field} = $result->$field() if ( $result->has( $field ) );
			}
		}
	}

	return { contacts => \@result, system => $system, labels => $self->_field_labels() };
}

1;
