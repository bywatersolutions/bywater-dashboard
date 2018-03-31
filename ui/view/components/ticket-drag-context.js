import React from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { connect } from 'react-redux';

import * as actions from '../../control/actions';

@connect( () => ( {} ) )
export default class TicketDragContext extends React.Component {
    onDragEnd = result => {
        if ( !result.destination ) return;

        let [ kind, , ticketID ] = result.draggableId.split( ':' );

        if ( kind != 'ticket' || !( parseInt( ticketID ) > 0 ) ) return;

        let [ sourceKind, ...sourceID ] = result.source.droppableId.split( ':' );
        let [ destinationKind, ...destinationID ] = result.destination.droppableId.split( ':' );

        let sourceParams = {};

        if ( sourceKind == 'column' ) {
            sourceParams = {
                sourceID,
                sourceColumnIndex: result.source.index,
            };
        }

        switch ( destinationKind ) {
            case 'user':
                this.props.dispatch( actions.ticketMoveOwner( {
                    ticketID,
                    destinationID,
                    rt_username: destinationID[ 0 ],
                    ...sourceParams,
                } ) );
                break;

            case 'column':
                this.props.dispatch( actions.ticketMoveColumn( {
                    ticketID,
                    destinationID,
                    destinationColumnIndex: result.destination.index,
                    ...sourceParams,
                } ) );
                break;
        }
    }

    render() {
        return <DragDropContext onDragEnd={this.onDragEnd}>
            { this.props.children }
        </DragDropContext>;
    }
}
