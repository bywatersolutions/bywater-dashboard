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
import ReactDOM from 'react-dom';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { connect } from 'react-redux';

import { connectWithStyles, withOurStyles } from '../../common';

@connectWithStyles( ( { tickets }, { ticketID } ) => ( { ticket: tickets[ticketID] } ) )
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

        return <Draggable draggableId={ticketID}>
            { ( provided, snapshot ) => 
                <React.Fragment>
                    <ListItem
                            button
                            ref={ ( node ) => provided.innerRef( node && ReactDOM.findDOMNode(node) ) }
                            { ...provided.draggableProps }
                            { ...provided.dragHandleProps }
                        >
                        <ListItemText
                            className={ isDragging ? classes.dragging : null }
                            primary={ "#" + ticketID }
                            secondary={ ticket ? ticket.Subject : "Loading..." }
                        />
                    </ListItem>
                    { provided.placeholder }
                </React.Fragment>
            }
        </Draggable>;
    }
}

@withOurStyles
export class TicketList extends React.Component {
    render() {
        const { classes, tickets, title } = this.props;

        return <Droppable droppableId={title}>
            { ( provided, snapshot ) => 
                <div ref={ provided.innerRef }>
                    <Card
                        className={ snapshot.isDraggingOver ? classes.dragOver : null }
                    >
                        <CardHeader title={title} />
                        <CardContent>
                            <Divider />
                            <List>
                                { tickets.map( ticketID => <TicketItem key={ticketID} ticketID={ticketID} /> ) }
                                { provided.placeholder }
                            </List>
                        </CardContent>
                    </Card>
                </div>
            }
        </Droppable>;
    }
}
