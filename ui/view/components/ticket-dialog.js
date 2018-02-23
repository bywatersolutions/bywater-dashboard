"use strict";

// Dialog view for a single ticket.

import {
    AppBar,
    Divider,
    Icon,
    IconButton,
    Tab,
    Tabs,
    Toolbar,
    Typography,
} from 'material-ui';

import Dialog, {
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    withMobileDialog,
} from 'material-ui/Dialog';

import Table, {
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from 'material-ui/Table';

const MobileDialog = withMobileDialog( { breakpoint: "sm" } )( Dialog );

import React from 'react';
import SwipeableViews from 'react-swipeable-views';

import { connectWithStyles, withOurStyles } from '../../common';
import * as actions from '../../control/actions';

import TicketHistoryList from './ticket-history';

@connectWithStyles(
    ( { user, inProgress, tickets }, { ticketID } ) => ( {
        popup_config: user.popup_config,
        ticket: tickets[ticketID],
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
            ) && !ticket.history
        ) {
            dispatch( actions.getHistory( { ticket_id: ticketID } ) );
        }
    }

    render() {
        const {
            classes,
            popup_config,
            open,
            onClose,
            ticket,
            ticketID,
        } = this.props;

        if ( !ticket ) return null;

        return <MobileDialog
                classes={{ paper: classes.fixedDialogPaper }}
                maxWidth={false}
                open={open}
                onClose={onClose}
                aria-labelledby="ticket-dialog-title"
            >
            <AppBar color="default" position="static">
                <Toolbar disableGutters={true}>
                    <IconButton
                            aria-label="Close"
                            color="secondary"
                            onClick={onClose}
                        >
                        <Icon style={ { verticalAlign: 'bottom' } }>close</Icon>
                    </IconButton>
                    <Typography
                            id="ticket-dialog-title"
                            type="title"
                            color="inherit"
                            style={{ flex: 1 }}
                        >
                        Ticket #{ticketID} - {ticket.Subject}
                    </Typography>
                    <IconButton
                            aria-label="Open in RT"
                            color="primary"
                            onClick={ () => window.open( ticket.link ) }
                        >
                        <Icon style={ { verticalAlign: 'bottom' } }>exit_to_app</Icon>
                    </IconButton>
                </Toolbar>
                <Tabs
                        value={this.state.tab}
                        indicatorColor="black"
                        onChange={ ( event, tab ) => this.setState( { tab } ) }
                        centered
                        fullWidth
                    >
                    <Tab label="DETAILS" />
                    <Tab label="HISTORY" />
                </Tabs>
            </AppBar>
            <DialogContent>
                <SwipeableViews
                    disableLazyLoading={true}
                    index={this.state.tab}
                    onChangeIndex={ tab => this.setState( { tab } ) }
                    style={{ height: "100%" }}
                    containerStyle={{ height: "100%" }}
                >
                    <Table>
                        <TableHead>
                            <TableRow>
                                { popup_config.header_row.map( ( [ label, , sourceField ] ) => <TableCell key={sourceField}>{label}</TableCell> ) }
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                { popup_config.header_row.map( ( [ , source, sourceField ] ) => <TableCell key={sourceField}>{ticket[sourceField]}</TableCell> ) }
                            </TableRow>
                        </TableBody>
                    </Table>
                    <TicketHistoryList ticketID={ticketID} />
                </SwipeableViews>
            </DialogContent>
        </MobileDialog>;
    }
}
