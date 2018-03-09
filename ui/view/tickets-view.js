import {
    Grid,
} from 'material-ui';

import GridList, {
    GridListTile,
    GridListTileBar,
} from 'material-ui/GridList';

import {
    LinearProgress,
} from 'material-ui/Progress';

import withWidth from 'material-ui/utils/withWidth';

import React from 'react';
import { Droppable } from 'react-beautiful-dnd';

import { connectWithStyles } from '../common';
import * as actions from '../control/actions';
import TicketDragContext from './components/ticket-drag-context';
import TicketList from './components/ticket-list';

@withWidth()
class AssignUserGrid extends React.Component {
    render() {
        const { numUsedColumns, users, width } = this.props;

        let orderedUsers = Object.values( users );
        orderedUsers.sort( ( a, b ) => a.last_name.localeCompare( b.last_name ) );

        if ( width == 'xs' ) return null;

        const smUserListWidth = 12 - 4 * numUsedColumns;
        const mdUserListWidth = 12 - 2 * numUsedColumns;
        const gridCols = ( width == 'sm' ? smUserListWidth : mdUserListWidth ) / 2;

        return <Grid
                item
                sm={smUserListWidth}
                md={mdUserListWidth}
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
                                    <GridListTileBar title={ user.first_name + ' ' + user.last_name} />
                                </React.Fragment>
                            }
                        </Droppable>
                    </GridListTile>
                ) }
            </GridList>
        </Grid>;
    }
}

@connectWithStyles( ( { inProgress, views, user }, { viewInfo } ) => ( {
    view: views[ viewInfo.view_id ],
    loading: !!inProgress.GET_VIEW,
    users: user && user.users,
} ) )
export default class TicketsView extends React.Component {
    componentWillMount() {
        this.props.dispatch( actions.getView( { viewID: this.props.viewInfo.view_id } ) );
    }

    render() {
        const {
            classes,
            dispatch,
            loading,
            users,
            view: { columns = {} } = {},
            viewInfo,
        } = this.props;

        let extra = JSON.parse( viewInfo.extra );
        let hasAssign = ( extra.has || [] ).includes( 'usergrid' ) && users;

        let orderedColumns = Object.values( columns );
        orderedColumns.sort( ( a, b ) => a.column_order - b.column_order );

        return <TicketDragContext>
            <div className={ classes.page }>
                { loading ? <LinearProgress /> :
                    <Grid container spacing={24}>
                        { orderedColumns.map( column => <Grid item xs={12} sm={4} md={2} key={column.column_id}>
                            <TicketList viewID={viewInfo.view_id} column={column} />
                        </Grid> ) }
                        { hasAssign && <AssignUserGrid numUsedColumns={ orderedColumns.length } users={ users } /> }
                    </Grid>
                }
            </div>
        </TicketDragContext>;
    }
}
