#!/bin/sh

export DBIC_MIGRATION_SCHEMA_CLASS=DashboardApp::Schema
export PERL5LIB=./local/lib/perl5/:./lib
export PATH="$PATH:./local/bin"
exec bash
