"use strict";

import {
    Card,
    CardContent,
    CardHeader,
    Divider,
} from 'material-ui';

import List, {
    ListItem,
    ListItemText,
} from 'material-ui/List';

import React from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import { connect } from 'react-redux';

import { connectWithStyles, withOurStyles } from '../../common';

const ticketSource = {
    beginDrag( props ) {
        return { ticketID: props.ticketID };
    },
};

const ticketTarget = {
    drop( props ) {
        console.debug( 'drop!', props );
    },
};

function decoratedNativeComponent( type, ...decorators ) {
    return ( { children, ...props } ) => (
        _.flow( decorators )(
            React.createElement(
                type,
                props,
                children
            )
        )
    );
}

@connectWithStyles( ( { tickets }, { ticketID } ) => ( { ticket: tickets[ticketID] } ) )
@DropTarget( 'TICKET', ticketTarget, connect => ( {
	connectDropTarget: connect.dropTarget(),
} ) )
@DragSource( 'TICKET', ticketSource, ( connect, monitor ) => ( {
	connectDragSource: connect.dragSource(),
	isDragging: monitor.isDragging(),
} ) )
class TicketItem extends React.Component {
    render() {
        const {
            classes,
            connectDragSource,
            connectDropTarget,
            isDragging,
            ticket,
            ticketID,
        } = this.props;

        return <ListItem
                button
                component={ decoratedNativeComponent( 'li', connectDragSource, connectDropTarget ) }
            >
            <ListItemText
                className={ isDragging ? classes.dragging : null }
                primary={ "#" + ticketID }
                secondary={ ticket ? ticket.Subject : "Loading..." }
            />
        </ListItem>;
    }
}

@withOurStyles
@DropTarget( 'TICKET', ticketTarget, ( connect, monitor ) => ( {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
} ) )
export class TicketList extends React.Component {
    render() {
        const { classes, connectDropTarget, isOver, tickets, title } = this.props;
        console.log( 'TL', title, isOver );

        return <Card
                component={ decoratedNativeComponent( 'div', connectDropTarget ) }
            >
            <CardHeader title={title} />
            <CardContent>
                <Divider />
                <List
                    className={ isOver ? classes.dragOver : null }
                >
                    { tickets.map( ticketID => <TicketItem key={ticketID} ticketID={ticketID} /> ) }
                </List>
            </CardContent>
        </Card>;
    }
}
