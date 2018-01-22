"use strict";

import {
    Card,
    CardContent,
    CardHeader,
    Divider,
    Grid,
    Typography,
} from 'material-ui';

import List, {
    ListItem,
    ListItemText,
} from 'material-ui/List';

import {
    LinearProgress
} from 'material-ui/Progress';

import React from 'react';
import { connect } from 'react-redux';

import { connectWithStyles } from '../common';
import * as actions from '../control/actions';

const TicketItem = connect( ( { tickets }, { ticketID } ) => ( { ticket: tickets[ticketID] } ) )( ( { ticket, ticketID } ) => {
    return <ListItem button>
        <ListItemText primary={ "#" + ticketID } secondary={ ticket ? ticket.Subject : "Loading..." } />
    </ListItem>;
} );

class MyTickets extends React.Component {
    componentWillMount() {
        this.props.dispatch( actions.getDashboard() );
    }

    render() {
        const { classes, dispatch, employee: { columns = {} }, loading } = this.props;

        let orderedColumns = Object.values( columns );
        orderedColumns.sort( ( a, b ) => a.column_order - b.column_order );

        return <div className={ classes.page }>
            { loading ? <LinearProgress /> :
                <Grid container spacing={24}>
                    { orderedColumns.map( column => <Grid item xs={12} sm={4} md={2} key={column.name}>
                        <Card>
                            <CardHeader title={column.name} />
                            <CardContent>
                                <Divider />
                                <List>
                                    { column.tickets.map( ticketID => <TicketItem key={ticketID} ticketID={ticketID} /> ) }
                                </List>
                            </CardContent>
                        </Card>
                    </Grid> ) }
                </Grid>
            }
        </div>;
    }
}

export default connectWithStyles( ( { inProgress, employee } ) => ( { employee, loading: !!inProgress.GET_DASHBOARD } ) )( MyTickets );
