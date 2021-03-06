#!/bin/bash

function get_config {
    local path=$1
    perl -MYAML -e 'print YAML::LoadFile("config/config.yaml")->'$path
}

export DBIC_MIGRATION_SCHEMA_CLASS=DashboardApp::Schema
export DBIC_MIGRATION_DSN=$(get_config '{db}->{dsn}')
export DBIC_MIGRATION_USERNAME=$(get_config '{db}->{username}')
export DBIC_MIGRATION_PASSWORD=$(get_config '{db}->{password}')
export PERL5LIB=./local/lib/perl5/:.
export PATH="$PATH:./local/bin"
exec $SHELL
