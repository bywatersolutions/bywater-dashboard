use utf8;
package DashboardApp::Schema::Result::View;

# Created by DBIx::Class::Schema::Loader
# DO NOT MODIFY THE FIRST PART OF THIS FILE

=head1 NAME

DashboardApp::Schema::Result::View

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

=head1 TABLE: C<views>

=cut

__PACKAGE__->table("views");

=head1 ACCESSORS

=head2 view_id

  data_type: 'integer'
  is_auto_increment: 1
  is_nullable: 0

=head2 role_id

  data_type: 'integer'
  is_foreign_key: 1
  is_nullable: 1

=head2 name

  data_type: 'text'
  is_nullable: 1

=cut

__PACKAGE__->add_columns(
  "view_id",
  { data_type => "integer", is_auto_increment => 1, is_nullable => 0 },
  "user_id",
  { data_type => "integer", is_foreign_key => 1, is_nullable => 0 },
  "name",
  { data_type => "text", is_nullable => 0 },
  "extra",
  { data_type => "text", is_nullable => 1 },
);

=head1 PRIMARY KEY

=over 4

=item * L</view_id>

=back

=cut

__PACKAGE__->set_primary_key("view_id");

=head1 RELATIONS

=head2 columns_rel

Type: has_many

Related object: L<DashboardApp::Schema::Result::Column>

=cut

__PACKAGE__->has_many(
  "columns",
  "DashboardApp::Schema::Result::Column",
  { "foreign.view_id" => "self.view_id" },
  { cascade_copy => 1, cascade_delete => 1 },
);

=head2 role

Type: belongs_to

Related object: L<DashboardApp::Schema::Result::UserRole>

=cut

__PACKAGE__->belongs_to(
  "user",
  "DashboardApp::Schema::Result::User",
  { user_id => "user_id" },
  {
    is_deferrable => 1,
    join_type     => "LEFT",
    on_delete     => "CASCADE",
    on_update     => "CASCADE",
  },
);

1;
