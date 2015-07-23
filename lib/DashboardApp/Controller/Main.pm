package DashboardApp::Controller::Main;
use Mojo::Base 'Mojolicious::Controller';

use DashboardApp::Model::User;
use DashboardApp::Model::Ticket;
use Try::Tiny;

sub index {
    my $self = shift;
}

sub login {
    my $c = shift;

    my $json = $c->req->json;
    my $roles;
    unless ( $roles = DashboardApp::Model::User::check( $json->{login}, $json->{password} ) ) {
        return $c->render(json => { error => "Wrong login or password." });
    }

    $c->session({ user_id => $json->{login}, roles => $roles });

    # Default view for a user will be the first role defined
    $c->render(json => { role => $roles->[0] });
}

sub logout {
        my $c = shift;

        $c->session( expires => 1 );

        $c->redirect_to('/');
}

sub get_roles {
    my $c = shift;
    $c->render(json => { roles => $c->session->{roles} });
}

sub update_ticket {
    my $c = shift;

    my $json = $c->req->json;

    my $ticket_id = $json->{ticket_id} || die "No ticket ID found!";
    my $params = {};

    if ( my $user_id = $json->{user_id} ) {
        my $users = DashboardApp::Model::User::get_all_users();
        if ( $users->{$user_id} and $users->{$user_id}->{rt_user_id} ) {
            $params->{owner} = $users->{$user_id}->{rt_user_id};
        } else {
            die "Unknown RT user!";
        }
    } else {
        foreach my $param ( qw/owner status queue/ ) {
            $params->{ $param } = $json->{ $param } if ( defined $json->{ $param } );
        }
    }

    DashboardApp::Model::Ticket::update_ticket( $ticket_id, $params );

    $c->render(json => { status => "ok" });
}

sub ticket_details {
    my $c = shift;

    my $json = $c->req->json;
    my $result = DashboardApp::Model::Ticket::get_tickets( $json->{ids} );

    $c->render( json => $result );
}

sub ticket_history {
    my $c = shift;

    my $json = $c->req->json;
    my $result = DashboardApp::Model::Ticket::get_history( $json->{ticket_id} );

    $c->render( json => $result );
}

1;
