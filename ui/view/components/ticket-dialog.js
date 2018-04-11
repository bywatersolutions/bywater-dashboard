// Dialog view for a single ticket.

import {
    Divider,
    Grid,
    Hidden,
    Icon,
    IconButton,
    Typography,
} from 'material-ui';

import React from 'react';
import { connect } from 'react-redux';

import * as actions from '../../control/actions';

import TabbedDialog, { TabbedDialogContent, TabbedDialogFooter } from './tabbed-dialog';
import TicketHistoryList from './ticket-history';

@connect(
    ( { tickets }, { ticketID } ) => ( {
        ticket: tickets[ ticketID ],
    } )
)
class TicketInfoGrid extends React.Component {
    render() {
        const {
            fields,
            justify = 'center',
            ticket,
        } = this.props;

        return <div style={{ padding: 24 }}>
            <Grid
                container
                justify={justify}
                spacing={24}
            >
                { fields.map( ( [ label, , sourceField ] ) =>
                    <Grid
                        item
                        md={3}
                        sm={6}
                        key={sourceField}
                        >
                        <Typography
                            align="center"
                            variant="body2"
                            color="inherit"
                            >
                            {label + ': '}
                        </Typography>
                        <Typography
                            align="center"
                            color="inherit"
                            >
                            {ticket[ sourceField ]}
                        </Typography>
                    </Grid>
                ) }
            </Grid>
        </div>;
    }
}

@connect(
    ( { user, inProgress, tickets }, { ticketID } ) => ( {
        popup_config: user.popup_config,
        ticket: tickets[ ticketID ],
    } )
)
export default class TicketDialog extends React.Component {
    state = {
        tab: 0,
    };

    componentWillReceiveProps( { open, ticketID, ticket, dispatch } ) {
        if (
            // We are open with a ticket, and either...
            open && ticketID &&
            (
                // We were not previously open..
                !this.props.open ||
                // ... or we did not previously have a ticket
                ( !this.props.ticket && ticket )
            ) && ( !ticket || !ticket.history )
        ) {
            dispatch( actions.getHistory( { ticket_id: ticketID } ) );
        }
    }

    render() {
        const {
            popup_config,
            open,
            onClose,
            ticket,
            ticketID,
        } = this.props;

        if ( !ticket ) return null;

        return <TabbedDialog
                open={open}
                onClose={onClose}
                title={`Ticket #${ticketID} - ${ticket.Subject}`}
                extraButtons={[
                    <IconButton
                            key="close"
                            aria-label="Open in RT"
                            color="primary"
                            onClick={ () => window.open( ticket.link ) }
                        >
                        <Icon style={ { verticalAlign: 'bottom' } }>open_in_new</Icon>
                    </IconButton>,
                ]}
                tabNames={[ 'HISTORY', 'DETAILS' ]}
        >
            <TabbedDialogContent>
                <TicketHistoryList ticketID={ticketID} />
                <div>
                    <Hidden smUp>
                        <TicketInfoGrid
                            fields={ popup_config.header_row.filter( ( [ , source ] ) => source == 'ticket' ) }
                            ticketID={ ticketID }
                        />
                        <Divider />
                    </Hidden>
                    <TicketInfoGrid
                        fields={ popup_config.detail_page.filter( ( [ , source ] ) => source == 'ticket' ) }
                        justify="flex-start"
                        ticketID={ ticketID }
                    />
                </div>
            </TabbedDialogContent>
            <Hidden xsDown>
                <TabbedDialogFooter>
                    <TicketInfoGrid
                        fields={ popup_config.header_row.filter( ( [ , source ] ) => source == 'ticket' ) }
                        ticketID={ ticketID }
                    />
                </TabbedDialogFooter>
            </Hidden>
        </TabbedDialog>;
    }
}
