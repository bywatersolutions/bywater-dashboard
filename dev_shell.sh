#!/bin/sh

export DBIC_MIGRATION_SCHEMA_CLASS=DashboardApp::Schema
export DBIC_MIGRATION_DSN=$(yq -r .db.dsn config/config.yaml)
export DBIC_MIGRATION_USERNAME=$(yq -r .db.username config/config.yaml)
export DBIC_MIGRATION_PASSWORD=$(yq -r .db.password config/config.yaml)
export PERL5LIB=./local/lib/perl5/:.
export PATH="$PATH:./local/bin"
exec $SHELL
