use utf8;
package DashboardApp::Schema::Result::Column;

# Created by DBIx::Class::Schema::Loader
# DO NOT MODIFY THE FIRST PART OF THIS FILE

=head1 NAME

DashboardApp::Schema::Result::Column

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

=head1 TABLE: C<columns>

=cut

__PACKAGE__->table("columns");

=head1 ACCESSORS

=head2 column_id

  data_type: 'integer'
  is_auto_increment: 1
  is_nullable: 0

=head2 view_id

  data_type: 'integer'
  is_foreign_key: 1
  is_nullable: 0

=head2 type

  data_type: 'enum'
  extra: {list => ["rt","custom"]}
  is_nullable: 1

=head2 rt_query

  data_type: 'text'
  is_nullable: 1

=head2 name

  data_type: 'text'
  is_nullable: 1

=head2 column_sort

  data_type: 'enum'
  default_value: 'ticket_id_asc'
  extra: {list => ["ticket_id_asc","ticket_id_desc"]}
  is_nullable: 1

=head2 column_order

  data_type: 'integer'
  default_value: 0
  is_nullable: 0

=cut

__PACKAGE__->add_columns(
  "column_id",
  { data_type => "integer", is_auto_increment => 1, is_nullable => 0 },
  "view_id",
  { data_type => "integer", is_foreign_key => 1, is_nullable => 0 },
  "type",
  {
    data_type => "enum",
    extra => { list => ["rt", "custom"] },
    is_nullable => 1,
  },
  "rt_query",
  { data_type => "text", is_nullable => 1 },
  "name",
  { data_type => "text", is_nullable => 1 },
  "column_sort",
  {
    data_type => "enum",
    default_value => "ticket_id_asc",
    extra => { list => ["ticket_id_asc", "ticket_id_desc"] },
    is_nullable => 1,
  },
  "column_order",
  { data_type => "integer", default_value => 0, is_nullable => 0 },
);

=head1 PRIMARY KEY

=over 4

=item * L</column_id>

=back

=cut

__PACKAGE__->set_primary_key("column_id");

=head1 RELATIONS

=head2 view

Type: belongs_to

Related object: L<DashboardApp::Schema::Result::View>

=cut

__PACKAGE__->belongs_to(
  "view",
  "DashboardApp::Schema::Result::View",
  { view_id => "view_id" },
  { is_deferrable => 1, on_delete => "CASCADE", on_update => "CASCADE" },
);


# Created by DBIx::Class::Schema::Loader v0.07043 @ 2015-11-18 14:46:15
# DO NOT MODIFY THIS OR ANYTHING ABOVE! md5sum:10gudl1kcvRo/uRVi68IkA


# You can replace this text with custom code or comments, and it will be preserved on regeneration
1;
