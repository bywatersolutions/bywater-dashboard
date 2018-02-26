use utf8;
package DashboardApp::Schema::Result::User;

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
  "avatar_url",
  { data_type => "text", is_nullable => 1 },
  "role",
  { data_type => "text", is_nullable => 0 },
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

=head2 views

Type: has_many

Related object: L<DashboardApp::Schema::Result::View>

=cut

__PACKAGE__->has_many(
  "views",
  "DashboardApp::Schema::Result::View",
  { "foreign.user_id" => "self.user_id" },
  { cascade_copy => 0, cascade_delete => 1 },
);


1;
