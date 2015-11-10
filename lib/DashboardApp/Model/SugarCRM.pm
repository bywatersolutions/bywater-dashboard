package DashboardApp::Model::SugarCRM;

use Mojo::Base -strict;
use Net::SugarCRM;
use DashboardApp::Model::Config;
use Digest::MD5 qw/md5_hex/;

use IO::Socket::SSL; # qw(debug3);
use Net::SSLeay;

my $api;
my @contact_fields = (
	'id',

	'name',
	'last_name',
	'full_name',
	'first_name',
	'title',
	'library_c',
	'contacttype_c',

	'phone_work',
	'notes',
	'email',
	'email1',

	'account_id',
	'account_name',

	'primary_address_street',
	'primary_address_city',
	'primary_address_state',
	'primary_address_country',
	'primary_address_postalcode',

	'modified_user_id',
	'modified_by_name',
);
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
	}

	return $api;
}

sub _field_labels {
	my ( $self ) = @_;

	unless ( $labels ) {
		my $result = $self->_api()->get_module_fields('Contacts');
		$labels = {};
		foreach my $field_id ( keys %{ $result->{module_fields} } ) {
		    $labels->{ $field_id } = $result->{module_fields}->{ $field_id }->{label};
		    $labels->{ $field_id } =~ s/:\s*$//;
		}
	}

	return $labels;
}

sub get_contact {
	my ( $self, $email ) = @_;
	my $contacts = $self->_api()->get_contacts_from_mail( $email );

	my @result;
	if ( $contacts ) {
		foreach my $contact ( @$contacts ) {
			my $item = {};
			foreach my $field ( @contact_fields ) {
				$item->{$field} = $contact->$field() if ( $contact->has( $field ) );
			}
			push( @result, $item );
		}
	}

	return { contacts => \@result, labels => $self->_field_labels() };
}

1;