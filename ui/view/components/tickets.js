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
class TicketPlaceholder extends React.Component {
    render() {
        const {
            classes,
            ticket,
            ticketID,
        } = this.props;

        return <ListItem>
            <ListItemText
                className={ classes.placeholder }
                primary={ "No tickets" }
            />
        </ListItem>;
    }
}

@connectWithStyles( ( { tickets }, { ticketID } ) => ( { ticket: tickets[ticketID] } ) )
class TicketItem extends React.Component {
    render() {
        const {
            classes,
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
                <Card
                    className={ snapshot.isDraggingOver ? classes.dragOver : null }
                >
                    <CardHeader title={title} />
                    <CardContent>
                        <Divider />
                        <div ref={ provided.innerRef }>
                            <List>
                                { tickets.map( ticketID => <TicketItem key={ticketID} ticketID={ticketID} /> ) }
                                { provided.placeholder || ( !tickets.length ? <TicketPlaceholder /> : null ) }
                            </List>
                        </div>
                    </CardContent>
                </Card>
            }
        </Droppable>;
    }
}
