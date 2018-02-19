"use strict";

import {
    Grid,
    Typography,
} from 'material-ui';

import {
    LinearProgress
} from 'material-ui/Progress';

import React from 'react';

import { connectWithStyles } from '../common';
import * as actions from '../control/actions';
import TicketDragContext from './components/ticket-drag-context';
import TicketList from './components/ticket-list';

class MyTickets extends React.Component {
    componentWillMount() {
        this.props.dispatch( actions.getDashboard() );
    }

    render() {
        const { classes, dispatch, employee: { columns = {} }, loading } = this.props;

        let orderedColumns = Object.values( columns );
        orderedColumns.sort( ( a, b ) => a.column_order - b.column_order );

        return <TicketDragContext>
            <div className={ classes.page }>
                { loading ? <LinearProgress /> :
                    <Grid container spacing={24}>
                        { orderedColumns.map( column => <Grid item xs={12} sm={4} md={2} key={column.column_id}>
                            <TicketList column={column} />
                        </Grid> ) }
                    </Grid>
                }
            </div>
        </TicketDragContext>;
    }
}

export default connectWithStyles( ( { inProgress, employee } ) => ( { employee, loading: !!inProgress.GET_DASHBOARD } ) )( MyTickets );
