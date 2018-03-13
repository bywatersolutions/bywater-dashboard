package DashboardApp::Model::User;

use JSON qw/encode_json/;
use Mojo::Base 'MojoX::Model';

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
                    column_order => $idx++,
                });
            }
        }
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
