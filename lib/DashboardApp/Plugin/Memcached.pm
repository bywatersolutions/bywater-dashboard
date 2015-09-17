package DashboardApp::Plugin::Memcached;
use base 'Mojolicious::Plugin';

use 5.010_000;

use strict;
use warnings;
use utf8;

use version; our $VERSION = qv('0.9.2');

use Carp;
use English qw( -no_match_vars );
use Readonly;

Readonly my $DEFAULT_MAX_REQUESTS => 1000;
Readonly my $DEFAULT_SERVERS      => ['127.0.0.1:11211'];

sub register {
    my ($plugin, $app, $config) = @_;

    $config ||= {};

    my $app_key         = $config->{'app_key'}      || 'memcached';
    my $max_requests    = $config->{'max_requests'} || $DEFAULT_MAX_REQUESTS;
    my $memcached_class = $config->{'class'}        || 'Cache::Memcached';
    my $params          = $config->{'params'}       || {};

    $app->log->debug(q{register DashboardApp::Plugin::Memcached});
    $app->log->debug(qq{trying to load $memcached_class});

    # try to use user defined module
    eval qq{use $memcached_class; 1;} or do {
        if ($EVAL_ERROR) {
            $app->log->error(qq{can't load $memcached_class});
            croak(qq{can't load $memcached_class});
        }
    };

    # create attribute for storing memcached client objects
    if (!ref($app)->can('_memcached')) {
        ref($app)->attr('_memcached');
        $app->_memcached({});
    }

    # create attibute for storing request counter for memcached clients objects
    if (!ref($app)->can('_memcached_request_counter')) {
        ref($app)->attr('_memcached_request_counter');
        $app->_memcached_request_counter({});
    }

    $app->_memcached_request_counter->{$app_key} = 0;

    my $code = sub {
        my $self = shift;

        my $memcached;

        if (exists $self->_memcached->{$app_key}) {
            $memcached = $self->_memcached->{$app_key};

            # increment request counter
            $self->_memcached_request_counter->{$app_key} =
              $self->_memcached_request_counter->{$app_key} + 1;
        }
        else {

            # create new object
            $self->_memcached->{$app_key} = $memcached_class->new(
                'servers' => $config->{'servers'} || $DEFAULT_SERVERS,
                %$params
            );
            $memcached = $self->_memcached->{$app_key};
        }

        return $memcached;
    };

    if (!ref($app)->can($app_key)) {

        # Create new method in module
        { no strict 'refs'; *{ref($app) . q{::} . $app_key} = $code };

    }
    else {
        croak(ref($app) . ' has already have ' . $app_key);
    }

    $app->hook(
        after_dispatch => sub {
            my $self = shift;
            my $c    = shift;

            if (exists $self->app->_memcached_request_counter->{$app_key}
                and $self->app->_memcached_request_counter->{$app_key} >=
                $max_requests)
            {
                delete $self->app->_memcached->{$app_key};
                $self->app->_memcached_request_counter->{$app_key} = 0;
            }

            return;
        }
    );

    return;
}

1;

__END__

=head1 NAME

Mojolicious::Plugin::Memcached - Memcached Plugin

=head1 SYNOPSIS

  # Mojolicious
  $self->plugin(memcached => {servers => ['127.0.0.1:11211']});

  # Mojolicious::Lite
  plugin memcached => {params => {servers => ['127.0.0.1:11211']}};

  # Controller action
  my $memcached = $self->app->memcached();

=head1 DESCRIPTION

L<Mojolicious::Plugin::Memcached> is a plugin to easily use various Memcached
clients on L<Mojolicious::Controller>.

=head2 OPTIONS

=head2 C<app_key>

  # Mojolicious::Lite
  plugin memcached => {app_key => 'cache'};

Name of the method through which you can get it action of
the L<Mojolicious::Controller>, defaults to C<memcached>.

=head2 C<max_requests>

  # Mojolicious::Lite
  plugin memcached => {max_requests => 10000};

Number of appeals, after which the object will be deleted and recreated,
defaults to C<1000>.

=head2 C<class>

  # Mojolicious::Lite
  plugin memcached => {class => 'Memcached::Client'};

Used to specify the class name, defaults to C<Cache::Memcached>.

=head2 C<params>

  # Mojolicious::Lite
  plugin memcached => {params => {debug => 1, compress_threshold => 5000}};

A hash is used to pass parameters to the constructor of the class.

=head1 METHODS

L<Mojolicious::Plugin::Memcached> inherits all methods from
L<Mojolicious::Plugin> and implements the following new ones.

=head2 C<register>

  $plugin->register;

Register plugin hooks in L<Mojolicious> application.

=head1 COMPLETE EXAMPLE

  # config.json
  {
      "memcached": {
          // Cache::Memcached
          "memcached": {
              "app_key": "memcached",
              "max_requests": 100,
              "class": "Cache::Memcached",
              "params": {
                  "servers": ["192.168.254.3:11211"],
                  "debug": 0,
                  "compress_threshold": 10000
              }
          },
          // Cache::Memcached::Fast
          "memcached_fast": {
              "app_key": "memcached_fast",
              "max_requests": 10000,
              "class": "Cache::Memcached::Fast",
              "params": {
                  "servers": ['192.168.254.2:11211'],
                  "namespace": "my:",
                  "connect_timeout": 0.2,
                  "io_timeout": 0.5,
                  "close_on_error": 1,
                  "compress_threshold": 100000,
                  "compress_ratio": 0.9
              }
          }
      }
  }

  # Mojolicious
  # in startup sub

  # Setup Mojolicious::Plugin::JsonConfig
  my $config = $self->plugin(
      json_config => {
          file      => 'config.json',
          stash_key => 'config'
      }
  );

  for my $mem_conf (%{$config->{'memcached'}}) {
      $self->plugin(memcached => {
          app_key => $mem_conf->{'app_key'},
          max_requests => $mem_conf->{'max_requests'},
          class => $mem_conf->{'class'},
          params => $mem_conf->{'params'}
      });
  }

  # In controller action
  my $memcached = $self->app->memcached();
  my $memcached_fast = $self->app->memcached_fast();

=head1 SEE ALSO

L<Mojolicious>, L<Mojolicious::Guides>, L<http://mojolicio.us>.

=head1 AUTHOR

Nikolai Sevostjanov, E<lt>nikolai.sevostjanov@gmail.comE<gt>

=head1 COPYRIGHT AND LICENSE

Copyright (C) 2011 by Nikolai Sevostjanov

This library is free software; you can redistribute it and/or modify
it under the same terms as Perl itself, either Perl version 5.12.3 or,
at your option, any later version of Perl 5 you may have available.

=cut
