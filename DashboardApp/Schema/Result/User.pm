use utf8;
package DashboardApp::Schema::Result::User;

# Created by DBIx::Class::Schema::Loader
# DO NOT MODIFY THE FIRST PART OF THIS FILE

=head1 NAME

DashboardApp::Schema::Result::User

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

=head1 TABLE: C<users>

=cut

__PACKAGE__->table("users");

=head1 ACCESSORS

=head2 user_id

  data_type: 'integer'
  is_auto_increment: 1
  is_nullable: 0

=head2 rt_username

  data_type: 'varchar'
  is_nullable: 0
  size: 255

=head2 first_name

  data_type: 'text'
  is_nullable: 1

=head2 last_name

  data_type: 'text'
  is_nullable: 1

=head2 avatar_url

  data_type: 'text'
  is_nullable: 1

=cut

__PACKAGE__->add_columns(
  "user_id",
  { data_type => "integer", is_auto_increment => 1, is_nullable => 0 },
  "rt_username",
  { data_type => "varchar", is_nullable => 0, size => 255 },
  "first_name",
  { data_type => "text", is_nullable => 1 },
  "last_name",
  { data_type => "text", is_nullable => 1 },
  "avatar_url",
  { data_type => "text", is_nullable => 1 },
);

=head1 PRIMARY KEY

=over 4

=item * L</user_id>

=back

=cut

__PACKAGE__->set_primary_key("user_id");

=head1 UNIQUE CONSTRAINTS

=head2 C<rt_username>

=over 4

=item * L</rt_username>

=back

=cut

__PACKAGE__->add_unique_constraint("rt_username", ["rt_username"]);

=head1 RELATIONS

=head2 user_roles

Type: has_many

Related object: L<DashboardApp::Schema::Result::UserRole>

=cut

__PACKAGE__->has_many(
  "user_roles",
  "DashboardApp::Schema::Result::UserRole",
  { "foreign.user_id" => "self.user_id" },
  { cascade_copy => 0, cascade_delete => 0 },
);


# Created by DBIx::Class::Schema::Loader v0.07043 @ 2015-11-18 14:46:15
# DO NOT MODIFY THIS OR ANYTHING ABOVE! md5sum:UoJmR971JX+Ve62AYG9p/A


# You can replace this text with custom code or comments, and it will be preserved on regeneration
1;
