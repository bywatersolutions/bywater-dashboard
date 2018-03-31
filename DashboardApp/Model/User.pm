package DashboardApp::Model::User;

use JSON qw/encode_json/;
use Mojo::Base 'MojoX::Model';
use RT::Client::REST::Forms;
use Try::Tiny;

sub login {
    my ( $self, $username, $password ) = @_;

    my $ticket_model = DashboardApp::Model::Ticket->new;
    my $rt = $ticket_model->rt;
    return unless try {
        $rt->login( user => $username, pass => $password );

        return 1;
    } catch {
        if ( !ref $_ && !$_->isa( 'RT::Client::REST::AuthenticationFailureException' ) ) {
            die $_;
        } else {
            return 0;
        }
    };

    my $user = $self->app->schema->resultset('User')->search({ rt_username => $username })->first;

    unless ( $user ) {
        my $result = form_parse( $rt->_submit( "/user/$username" )->decoded_content );
        my ( $comments, $objects, $values, $errors ) = @{ $result->[0] };

        die $errors if $errors;

        # TODO hardcoded to employees, this distinction will go away and instead inform role
        # selection
        return unless $values->{Organization} eq 'ByWater';

        $user = $self->app->schema->resultset( 'User' )->create({
            rt_username => $username,
            real_name => $values->{RealName},
            role => 'employee',
        });
    }

    my $rt_cookie = JSON->new->encode( { COOKIES => $rt->_cookie->{COOKIES} } );

    return $user, { rt_cookie => $rt_cookie };
}

sub get_all_users {
    my ( $self ) = @_;

    my $users = {};
    foreach my $user ( $self->app->schema->resultset('User')->search({})->all ) {
        my $hashref = { $user->get_columns };
        $users->{ $user->rt_username } = $hashref;
    }

    return $users;
}

sub get_views {
    my ( $self, $user_id ) = @_;

    my $role = $self->app->schema->resultset('User')->search({ user_id => $user_id })->get_column('role')->first;

    return [] unless $role;

	unless ( $self->app->schema->resultset('View')->count( { user_id => $user_id } ) ) {
		my $config = DashboardApp::Model::Config::get_config();

        $self->app->schema->txn_do( sub {
            foreach my $view ( @{ $config->{ $role . '_default_views' } } ) {
            use Data::Dumper; warn Dumper( $view );
                my $db_view = $self->app->schema->resultset('View')->create({
                    user_id => $user_id,
                    name => $view->{name},
                    extra => encode_json( { has => $view->{has} } ),
                });

                my $idx = 0;
                foreach my $column ( @{ $view->{columns} } ) {
                    $db_view->add_to_columns({
                        name         => $column->{name},
                        type         => $column->{type},
                        rt_query     => $column->{rt_query},
                        drop_action  => encode_json( $column->{drop_action} || {} ),
                        column_order => $idx++,
                    });
                }
            }
        } );
	}

    return [ map +{
        $_->get_columns,
        columns => [ map +{ $_->get_columns }, $_->columns->all ]
    }, $self->app->schema->resultset('View')->search(
        { user_id => $user_id },
        { prefetch => 'columns' }
    )->all ];
}

1;
