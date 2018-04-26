import _ from 'lodash';

import {
    Grid,
} from 'material-ui';

import GridList, {
    GridListTile,
    GridListTileBar,
} from 'material-ui/GridList';

import withWidth from 'material-ui/utils/withWidth';

import React from 'react';
import { Droppable } from 'react-beautiful-dnd';

import { connectWithStyles } from '../common';
import * as actions from '../control/actions';
import TicketDragContext from './components/ticket-drag-context';
import TicketList from './components/ticket-list';

const COLUMN_WIDTHS = {
    xs: 12,
    sm: 4,
    md: 3,
    lg: 2,
    xl: 2,
};

const USER_SIZES = {
    xs: 4,
    sm: 3,
    md: 2,
    lg: 1.5,
    xl: 1,
};

@withWidth()
class AssignUserGrid extends React.Component {
    render() {
        const { numUsedColumns, users, width } = this.props;

        let orderedUsers = Object.values( users );
        orderedUsers.sort( ( a, b ) => a.real_name.localeCompare( b.real_name ) );

        // We force the grid to be 12 columns wide if there's not enough room, so it wraps to the
        // next line
        const userListWidth = Math.max( 0, 12 - COLUMN_WIDTHS[ width ] * numUsedColumns ) || 12;
        const gridCols = Math.floor( userListWidth / USER_SIZES[ width ] );

        return <Grid
                item
                xs={userListWidth}
                sm={userListWidth}
                md={userListWidth}
                lg={userListWidth}
                xl={userListWidth}
            >
            <GridList cols={ gridCols }>
                { orderedUsers.map( user =>
                    <GridListTile key={user.rt_username}>
                        <img src={user.avatar_url} />
                        {
                            // This is a bit nuts, but we can't do the draggable in two ways that
                            // would make more sense:
                            //
                            //   a) We can't put it on the GridListTile because it confuses the
                            //     autosizing of GridList, and
                            //   b) We can't wrap a div around the
                            //     contents of the GridListTile, because then it won't autosize the
                            //     <img>.
                        }
                        <Droppable droppableId={ 'user:' + user.rt_username }>
                            { ( provided, snapshot ) =>
                                <React.Fragment>
                                    {
                                        // This is placed between the image and tilebar so the image
                                        // fades but the text doesn't.
                                    }
                                    <div
                                        ref={provided.innerRef}
                                        style={{
                                            backgroundColor: snapshot.isDraggingOver ? 'rgba( 0, 0, 0, .3 )' : null,

                                            position: 'absolute',
                                            left: 0,
                                            top: 0,
                                            width: '100%',
                                            height: '100%',
                                            pointerEvents: 'none',
                                        }}
                                    />
                                    <GridListTileBar title={ user.real_name } />
                                </React.Fragment>
                            }
                        </Droppable>
                    </GridListTile>
                ) }
            </GridList>
        </Grid>;
    }
}

@connectWithStyles( ( { user } ) => ( {
    users: user && user.users,
} ) )
export default class TicketsView extends React.Component {
    componentWillMount() {
        if ( this.props.view.columns.length == 0 ) return;

        this.props.dispatch( actions.getColumnResults( {
            columnIDs: this.props.view.columns.map( ( { column_id } ) => column_id ),
        } ) );
    }

    hasAssignUsers() {
        let extra = JSON.parse( this.props.view.extra ) || {};
        return ( extra.has || [] ).includes( 'usergrid' );
    }

    render() {
        const {
            classes,
            users,
            view,
        } = this.props;

        let orderedColumns = Object.values( view.columns );
        orderedColumns.sort( ( a, b ) => a.column_order - b.column_order );

        let columnWidths = { ...COLUMN_WIDTHS };
        // If there's no user grid, stretch the columns to full width
        if ( !this.hasAssignUsers() ) {
            columnWidths.lg = true;
            columnWidths.xl = true;
        }

        return <TicketDragContext>
            <div className={ classes.page }>
                <Grid container spacing={24}>
                    { orderedColumns.map( column => <Grid item {...columnWidths} key={column.column_id}>
                        <TicketList viewID={view.view_id} column={column} />
                    </Grid> ) }
                    {
                        this.hasAssignUsers() &&
                        users &&
                        <AssignUserGrid numUsedColumns={ orderedColumns.length } users={ users } />
                    }
                </Grid>
            </div>
        </TicketDragContext>;
    }
}
