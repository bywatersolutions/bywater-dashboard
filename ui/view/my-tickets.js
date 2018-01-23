"use strict";

import {
    Grid,
    Typography,
} from 'material-ui';

import {
    LinearProgress
} from 'material-ui/Progress';

import React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import { connectWithStyles } from '../common';
import * as actions from '../control/actions';
import { TicketList } from './components/tickets';

@DragDropContext( HTML5Backend )
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
                        <TicketList title={column.name} tickets={column.tickets} />
                    </Grid> ) }
                </Grid>
            }
        </div>;
    }
}

export default connectWithStyles( ( { inProgress, employee } ) => ( { employee, loading: !!inProgress.GET_DASHBOARD } ) )( MyTickets );
