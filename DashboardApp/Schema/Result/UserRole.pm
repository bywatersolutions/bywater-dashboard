use utf8;
package DashboardApp::Schema::Result::UserRole;

# Created by DBIx::Class::Schema::Loader
# DO NOT MODIFY THE FIRST PART OF THIS FILE

=head1 NAME

DashboardApp::Schema::Result::UserRole

=cut

use strict;
use warnings;

use base 'DBIx::Class::Core';

=head1 COMPONENTS LOADED

=over 4

=item * L<DBIx::Class::InflateColumn::DateTime>

=back

=cut

__PACKAGE__->load_components("InflateColumn::DateTime");

=head1 TABLE: C<user_roles>

=cut

__PACKAGE__->table("user_roles");

=head1 ACCESSORS

=head2 role_id

  data_type: 'integer'
  is_auto_increment: 1
  is_nullable: 0

=head2 user_id

  data_type: 'integer'
  is_foreign_key: 1
  is_nullable: 0

=head2 role

  data_type: 'enum'
  extra: {list => ["employee","lead"]}
  is_nullable: 1

=cut

__PACKAGE__->add_columns(
  "role_id",
  { data_type => "integer", is_auto_increment => 1, is_nullable => 0 },
  "user_id",
  { data_type => "integer", is_foreign_key => 1, is_nullable => 0 },
  "role",
  {
    data_type => "enum",
    extra => { list => ["employee", "lead"] },
    is_nullable => 1,
  },
);

=head1 PRIMARY KEY

=over 4

=item * L</role_id>

=back

=cut

__PACKAGE__->set_primary_key("role_id");

=head1 UNIQUE CONSTRAINTS

=head2 C<user_id>

=over 4

=item * L</user_id>

=item * L</role>

=back

=cut

__PACKAGE__->add_unique_constraint("user_id", ["user_id", "role"]);

=head1 RELATIONS

=head2 user

Type: belongs_to

Related object: L<DashboardApp::Schema::Result::User>

=cut

__PACKAGE__->belongs_to(
  "user",
  "DashboardApp::Schema::Result::User",
  { user_id => "user_id" },
  { is_deferrable => 1, on_delete => "CASCADE", on_update => "CASCADE" },
);

=head2 views

Type: has_many

Related object: L<DashboardApp::Schema::Result::View>

=cut

__PACKAGE__->has_many(
  "views",
  "DashboardApp::Schema::Result::View",
  { "foreign.role_id" => "self.role_id" },
  { cascade_copy => 0, cascade_delete => 0 },
);


# Created by DBIx::Class::Schema::Loader v0.07043 @ 2015-11-17 18:20:26
# DO NOT MODIFY THIS OR ANYTHING ABOVE! md5sum:DVkDw+fzFruPomfbrRftcA


# You can replace this text with custom code or comments, and it will be preserved on regeneration
1;
