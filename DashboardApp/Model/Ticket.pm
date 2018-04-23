package DashboardApp::Model::Ticket;

use Mojo::Base -strict;
use Mojo::Exception;
use Mojo::Log;
use RT::Client::REST;
use RT::Client::REST::Forms;
use DashboardApp::Model::Config;

use IO::Socket::SSL; # qw(debug3);
use Net::SSLeay;
use JSON qw/decode_json/;
use Try::Tiny;

my $config = DashboardApp::Model::Config::get_config();
die "RT configuration not found." unless ( $config->{rt} );

my @queues;

sub new {
    my ( $class, $memcached, $rt_cookie ) = @_;
    return bless( {
        memcached => $memcached,
        rt_cookie => $rt_cookie,
        log => Mojo::Log->new(),
    }, $class );
}

sub rt {
    my ( $self ) = @_;

    unless ( $self->{rt} ) {
        my $rt = RT::Client::REST->new( server => $config->{rt}->{api_url} || $config->{rt}->{url}, timeout => 15 );

        if ( $config->{rt}->{ignore_ssl_errors} ) {
            IO::Socket::SSL::set_ctx_defaults( verify_mode => Net::SSLeay->VERIFY_NONE() );
            $rt->_ua->ssl_opts( verify_hostname => 0 );
        }
        $rt->_ua->env_proxy;

        $rt->_cookie( bless( decode_json( $self->{rt_cookie} ), 'HTTP::Cookies' ) ) if ( $self->{rt_cookie} );
        $self->{rt} = $rt;
    }

    return $self->{rt};
}

sub _rt_call {
    my ( $self, $url, $content ) = @_;

    my $response = $self->rt->_submit( $url, $content )->decoded_content;

    return form_parse( $response );
}

=head2 ping

=over 4
my $login_valid = $c->tickets_model->ping();
=end

Checks that we have a currently-valid RT cookie.

=cut
sub ping {
    my ( $self ) = @_;
    return try {
        # If it takes longer than this, we might as well just have the user log in.
        $self->rt->timeout( 3 );
        # This is the same method that RT::Client::REST itself uses to log in.
        $self->rt->_submit( "/ticket/1" );

        1;
    } catch {
        if ( $_->isa('RT::Client::REST::AuthenticationFailureException') ) {
            0;
        } elsif ( $_->isa('RT::Client::REST::RequestTimedOutException') ) {
            0;
        } else {
            $_->rethrow;
        }
	} finally {
        $self->rt->timeout( 15 );
    };
}

sub get_queues {
    my ( $self ) = @_;

    if ( !@queues ) {
        my @ids = $self->rt->search( type => 'queue', query => "" );
        foreach my $id ( @ids ) {
            my $info = $self->rt->show( type => 'queue', id => $id );
            $info->{id} =~ /(\d+)$/;

            push( @queues, { id => $1, name => $info->{Name}, description => $info->{Description} } );
        }
    }

    return \@queues;
}

sub search_tickets {
    my ( $self, $search_query ) = @_;

    my @ids = $self->rt->search( type => 'ticket', query => $search_query );
    return \@ids;
}

sub get_tickets {
    my ( $self, $ids ) = @_;

    my $result = {};
    return $result unless scalar @$ids;

    foreach my $form ( @{ $self->_rt_call( 'show', { id => 'ticket/' . join( ',', @$ids ) } ) } ) {
        my ( $comments, $objects, $values, $errors ) = @$form;

        next if $errors;

        my $id = $values->{id};
        $id =~ s,^ticket/,,g;
        $result->{$id} = $values;

        $result->{$id}->{link} = $config->{rt}->{url} . "/Ticket/Display.html?id=" . $id;

        my @bug_ids = split( ",", $result->{$id}->{ $config->{rt}->{bugzilla_field_name} } || "" );
        $result->{$id}->{bugzilla_ids} = @bug_ids ? \@bug_ids : undef;
        $result->{$id}->{related_ids} = [];
        
        # Getting related RT tickets (related to same Bugzilla tickets)
        next unless ( scalar( @bug_ids ) );
        
        my @query;
        foreach my $bug_id ( @bug_ids ) {
            push( @query, "'CF.{Community Bug}' = '$bug_id'" );
        }
        
        my @related_ids = $self->rt->search( type => 'ticket', query => "(" . join( " OR ", @query ) . ") AND Id != '$id'" );
        $result->{$id}->{related_ids} = \@related_ids;
    }

    return $result;
}

sub update_ticket {
    my ( $self, $ticket_id, $params ) = @_;

    $self->rt->edit ( type => 'ticket', id => $ticket_id, set => $params );
}

sub get_history_entries {
    my ( $self, $ticket_id, $history_ids ) = @_;

    my $results = $self->{memcached}->get_multi(
        map { "history-entry-$_" } @$history_ids
    );

    my @uncached_history_ids = grep { !exists $results->{$_} } @$history_ids;

    if ( scalar @uncached_history_ids ) {
        foreach my $form ( @{ $self->_rt_call( 'show', { id => "ticket/$ticket_id/history/id/" . join( ',', @uncached_history_ids ) } ) } ) {
            my ( $comments, $order, $values, $errors ) = @$form;

            if ( $errors ) {
                Mojo::Exception->throw( "Error fetching 'ticket/$ticket_id/history' entries: $errors" );
            }

            $results->{ 'history-entry-' . $values->{id} } = $values;
            $self->{memcached}->set( "history-entry-" . $values->{id}, $values );
        }
    }

    return [ map { $results->{ "history-entry-$_" } } @$history_ids ];
}

sub get_history {
    my ( $self, $ticket_id ) = @_;

    my @items;

    # form_parse doesn't work on these, so we have to parse it by hand.
    my $response = $self->rt->_submit("ticket/$ticket_id/history")->decoded_content;

    my @lines = split("\n", $response);
    foreach my $line ( @lines ) {
        if (my ( $id, $descr ) = ( $line =~ /(\d+): (.*)/ ) ) {
            next if ( $descr =~ /^Outgoing email/ );
            next if ( $descr =~ /^Sending the previous .?mail/ );
            #push( @items, { id => $key, descr => $values->{$key} } );# if ( $descr =~ /Ticket created/ or $descr =~ /Correspondence added/ );
            push( @items, $id );
        }
    }

    return [] unless ( @items );

    my $initial_old = $config->{card_popup}->{history}->{initial_old};
    my $load_chunk = $config->{card_popup}->{history}->{load_chunk};
    my $initial_new = $config->{card_popup}->{history}->{initial_new};

    # We don't want to bother making the user load more entries unless there's at least another
    # chunk to load.
    if ( scalar @items <= ( $initial_old + $load_chunk + $initial_new ) ) {
        return {
            old => $self->get_history_entries( $ticket_id, \@items ),
            unloaded => [],
            new => [],
        };
    }

    return {
        old => $self->get_history_entries(
            $ticket_id,
            [ @items[ 0..( $initial_old - 1 ) ] ],
        ),
        unloaded => [ @items[ $initial_old..( $#items - $initial_new ) ] ],
        new => $self->get_history_entries(
            $ticket_id,
            [ @items[ ( -$initial_new )..-1 ] ],
        ),
    };
}

1;
