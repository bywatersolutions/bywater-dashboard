// Dialog view for a single ticket.

import {
    AppBar,
    Grid,
    Hidden,
    Icon,
    IconButton,
    Paper,
    Tab,
    Tabs,
    Toolbar,
    Typography,
} from 'material-ui';

import Dialog, {
    DialogContent,
    withMobileDialog,
} from 'material-ui/Dialog';

import Table, {
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from 'material-ui/Table';

const MobileDialog = withMobileDialog( { breakpoint: 'sm' } )( Dialog );

import React from 'react';
import SwipeableViews from 'react-swipeable-views';

import { connectWithStyles } from '../../common';
import * as actions from '../../control/actions';

import TicketHistoryList from './ticket-history';

@connectWithStyles(
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

    renderTicketTable( template ) {
        const { ticket } = this.props;
        return <Table>
            <TableHead>
                <TableRow>
                    { template.map( ( [ label, , sourceField ] ) =>
                        <TableCell key={sourceField}>{label}</TableCell>
                    ) }
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    { template.map( ( [ , , sourceField ] ) =>
                        <TableCell key={sourceField}>{ticket[ sourceField ]}</TableCell>
                    ) }
                </TableRow>
            </TableBody>
        </Table>;
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
                        <Icon style={ { verticalAlign: 'bottom' } }>open_in_new</Icon>
                    </IconButton>
                </Toolbar>
                <Tabs
                        value={this.state.tab}
                        indicatorColor="black"
                        onChange={ ( event, tab ) => this.setState( { tab } ) }
                        centered
                        fullWidth
                    >
                    <Tab label="HISTORY" />
                    <Tab label="DETAILS" />
                </Tabs>
            </AppBar>
            <DialogContent style={{ display: 'flex', flexDirection: 'column' }}>
                <SwipeableViews
                    disableLazyLoading={true}
                    index={this.state.tab}
                    onChangeIndex={ tab => this.setState( { tab } ) }
                    style={{ height: '100%' }}
                    containerStyle={{ height: '100%' }}
                >
                    <TicketHistoryList ticketID={ticketID} />
                    <div>
                        <Hidden smUp>
                            { this.renderTicketTable( popup_config.header_row.filter(
                                ( [ , source ] ) => source == 'ticket'
                            ) ) }
                        </Hidden>
                        { this.renderTicketTable( popup_config.detail_page.filter(
                            ( [ , source ] ) => source == 'ticket'
                        ) ) }
                    </div>
                </SwipeableViews>
            </DialogContent>
            <Hidden xsDown>
                <Paper elevation={1} component="footer">
                    <Grid
                            container
                            justify="center"
                            style={{ padding: 16 }}
                            spacing={24}
                        >
                        { popup_config.header_row.filter( ( [ , source ] ) => source == 'ticket' )
                            .map( ( [ label, , sourceField ] ) =>
                                <Grid
                                    item
                                    md={3}
                                    sm={6}
                                    key={sourceField}
                                    >
                                    <Typography
                                        align="center"
                                        type="body2"
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
                </Paper>
            </Hidden>
        </MobileDialog>;
    }
}
