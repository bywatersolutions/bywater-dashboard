package DashboardApp::Controller::Ticket;
use Mojo::Base 'Mojolicious::Controller';

use DashboardApp::Model::Ticket;
use DashboardApp::Model::SugarCRM;
use DashboardApp::Model::Bugzilla;
use Mojo::Exception;
use Try::Tiny;

sub update_ticket {
    my $c = shift;

    my $json = $c->req->json;

    my $ticket_id = $json->{ticket_id} || die "No ticket ID found!";
    my $params = { %$json };

    delete $params->{ticket_id};

    $c->tickets_model->update_ticket( $ticket_id, $params );

    $c->render(json => { status => "ok" });
}

sub ticket_details {
    my $c = shift;

    my $json = $c->req->json;
    my $result = $c->tickets_model->get_tickets( $json->{ids} );

    $c->render( json => $result );
}

sub ticket_history {
    my $c = shift;

    my $json = $c->req->json;
    my $result = $c->tickets_model->get_history( $json->{ticket_id} );

    $c->render( json => $result );
}

sub ticket_history_entries {
    my $c = shift;

    my $json = $c->req->json;
    my $result = $c->tickets_model->get_history_entries( $json->{ticket_id}, $json->{history_ids} );

    $c->render( json => $result );
}

sub ticket_add_correspondence {
    my $c = shift;
    my $json = $c->req->json;

    if ( $json->{privacy} eq "public" ) {
        $c->tickets_model->rt->correspond( ticket_id => $json->{ticket_id}, message => $json->{message} );
    } else {
        $c->tickets_model->rt->comment( ticket_id => $json->{ticket_id}, message => $json->{message} );
    }

    $c->render( json => { status => "ok" } );
}

sub ticket_search {
    my $c = shift;

    my $json = $c->req->json;
    
    my $ids = $c->tickets_model->search_tickets( $json->{query} );
    my $result = $c->tickets_model->get_tickets( $ids );

    $c->render( json => $result );
}

sub sugarcrm_get_contact {
    my $c = shift;

    my $json = $c->req->json;
    my $sugar = DashboardApp::Model::SugarCRM->new();

    my $data = $sugar->get_contact( $json->{email} );

    $c->render( json => $data );
}

sub bugzilla_get_bug {
    my $c = shift;
    
    my $json = $c->req->json;
    my $data;
    try {
        $data = DashboardApp::Model::Bugzilla->new()->get_bugs( $json->{bug_ids} );
    } catch {
        $data = { error => $_->message() }
    };
    
    $c->render( json => $data );
}

1;
