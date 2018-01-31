"use strict";

// Dialog view for a single ticket.

import Dialog, {
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from 'material-ui/Dialog';

import React from 'react';

import { connectWithStyles } from '../../common';

@connectWithStyles( ( { tickets }, { ticketID } ) => ( { ticket: tickets[ticketID] } ) )
export default class TicketDialog extends React.Component {
    render() {
        const {
            open,
            onClose,
            ticket,
            ticketID,
        } = this.props;

        if ( !ticket ) return null;

        return <Dialog
                open={open}
                onClose={onClose}
                aria-labeledby="ticket-dialog-title"
                maxWidth="md"
            >
            <DialogTitle id="ticket-dialog-title">Ticket #{ticketID} - {ticket.Subject}</DialogTitle>
            <DialogContent>
                <DialogContentText>Woah dog</DialogContentText>
            </DialogContent>
        </Dialog>;
    }
}
