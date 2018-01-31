"use strict";

// Underlying components for viewing and editing tickets.

import {
    Card,
    CardContent,
    CardHeader,
    Typography,
} from 'material-ui';

import List, {
    ListItem,
    ListItemText,
} from 'material-ui/List';

import React from 'react';
import ReactDOM from 'react-dom';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { connect } from 'react-redux';

import TicketDialog from './ticket-dialog';
import { connectWithStyles, withOurStyles } from '../../common';

// Used in empty ticket lists (when we're not holding a dragged ticket over them).
@withOurStyles
class TicketPlaceholder extends React.Component {
    render() {
        const { classes } = this.props;

        return <ListItem>
            <ListItemText
                className={ classes.placeholder }
                primary="No tickets"
            />
        </ListItem>;
    }
}

@connectWithStyles( ( { tickets }, { ticketID } ) => ( { ticket: tickets[ticketID] } ) )
class TicketItem extends React.Component {
    render() {
        const {
            classes,
            onClick,
            ticket,
            ticketID,
        } = this.props;

        return <Draggable draggableId={ticketID}>
            { ( provided, snapshot ) => {
                const interceptOnClick = ( event ) => {
                    if ( provided.dragHandleProps ) {
                        provided.dragHandleProps.onClick( event );

                        if ( event.defaultPrevented ) return;
                    }

                    onClick( event );
                };

                return <React.Fragment>
                    <ListItem
                            button
                            ref={ ( node ) => provided.innerRef( node && ReactDOM.findDOMNode(node) ) }
                            { ...provided.draggableProps }
                            { ...provided.dragHandleProps }
                            onClick={interceptOnClick}
                        >
                        <ListItemText
                            primary={ "#" + ticketID }
                            secondary={ ticket ? ticket.Subject : "Loading..." }
                        />
                    </ListItem>
                    { provided.placeholder }
                </React.Fragment>;
            } }
        </Draggable>;
    }
}

@withOurStyles
export default class TicketList extends React.Component {
    constructor( props ) {
        super( props );

        this.state = {
            // Technically, this state should be managed globally, but it SHOULD be impossible to
            // open two tickets anyway. We hope.
            openTicketID: null,
        };
    }

    openTicketDialog( ticketID ) {
        this.setState( { openTicketID: ticketID } );
    }

    closeTicketDialog( ticketID ) {
        this.setState( { openTicketID: null } );
    }

    render() {
        const { classes, tickets, title } = this.props;

        return <React.Fragment>
            { tickets.map( ticketID =>
                <TicketDialog
                    key={ticketID}
                    ticketID={ticketID}
                    open={this.state.openTicketID == ticketID}
                    onClose={ () => this.closeTicketDialog( ticketID ) }
                />
            ) }
            <Droppable droppableId={title}>
                { ( provided, snapshot ) => 
                    <Card
                        className={ snapshot.isDraggingOver ? classes.dragOver : null }
                    >
                        <CardContent>
                            <Typography type="headline">{title}</Typography>
                            <div ref={ provided.innerRef }>
                                <List>
                                    { tickets.map( ticketID => <TicketItem key={ticketID} ticketID={ticketID} onClick={ () => this.openTicketDialog( ticketID ) } /> ) }
                                    { provided.placeholder || ( !tickets.length ? <TicketPlaceholder /> : null ) }
                                </List>
                            </div>
                        </CardContent>
                    </Card>
                }
            </Droppable>
        </React.Fragment>;
    }
}
