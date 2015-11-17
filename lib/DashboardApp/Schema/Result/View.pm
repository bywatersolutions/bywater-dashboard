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
  "role_id",
  { data_type => "integer", is_foreign_key => 1, is_nullable => 1 },
  "name",
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
  "columns_rel",
  "DashboardApp::Schema::Result::Column",
  { "foreign.view_id" => "self.view_id" },
  { cascade_copy => 0, cascade_delete => 0 },
);

=head2 role

Type: belongs_to

Related object: L<DashboardApp::Schema::Result::UserRole>

=cut

__PACKAGE__->belongs_to(
  "role",
  "DashboardApp::Schema::Result::UserRole",
  { role_id => "role_id" },
  {
    is_deferrable => 1,
    join_type     => "LEFT",
    on_delete     => "CASCADE",
    on_update     => "CASCADE",
  },
);


# Created by DBIx::Class::Schema::Loader v0.07043 @ 2015-11-17 18:20:26
# DO NOT MODIFY THIS OR ANYTHING ABOVE! md5sum:hBGl/CkZ0v1NnqNZ/0TpTA


# You can replace this text with custom code or comments, and it will be preserved on regeneration
1;
