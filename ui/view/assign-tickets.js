"use strict";

import {
    Grid,
    Typography,
} from 'material-ui';

import GridList, {
    GridListTile,
    GridListTileBar,
} from 'material-ui/GridList';

import {
    LinearProgress
} from 'material-ui/Progress';

import React from 'react';
import { DragDropContext } from 'react-beautiful-dnd';

import { connectWithStyles } from '../common';
import * as actions from '../control/actions';
import TicketList from './components/ticket-list';

@connectWithStyles( ( { inProgress, employee, lead } ) => ( { employee, lead, loading: !!inProgress.GET_DASHBOARD || !!inProgress.GET_LEAD_DASHBOARD } ) )
export default class AssignTickets extends React.Component {
    componentWillMount() {
        if ( !this.props.loading && !this.props.employee.popup_config ) this.props.dispatch( actions.getDashboard() );
        this.props.dispatch( actions.getLeadDashboard() );
    }

    render() {
        const { classes, dispatch, lead: { columns = {}, users = {} }, loading } = this.props;

        let orderedColumns = Object.values( columns );
        orderedColumns.sort( ( a, b ) => a.column_order - b.column_order );

        let orderedUsers = Object.values( users );
        orderedUsers.sort( ( a, b ) => a.last_name.localeCompare( b.last_name ) );

        const userListWidth = 12 - 2 * orderedColumns.length;

        return <DragDropContext onDragEnd={ () => {} }>
            <div className={ classes.page }>
                { loading ? <LinearProgress /> :
                    <Grid container spacing={24}>
                        { orderedColumns.map( column => <Grid item xs={12} sm={4} md={2} key={column.name}>
                            <TicketList title={column.name} tickets={column.tickets} />
                        </Grid> ) }
                        <Grid item hidden={{ smDown: true }} md={userListWidth}>
                            <GridList cols={ userListWidth / 2 }>
                                { orderedUsers.map( user => 
                                    <GridListTile key={user.rt_username}>
                                        <img src={user.avatar_url} />
                                        <GridListTileBar title={user.first_name + " " + user.last_name} />
                                    </GridListTile>
                                ) }
                            </GridList>
                        </Grid>
                    </Grid>
                }
            </div>
        </DragDropContext>;
    }
}
