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
            index,
            ticket,
            column_id,
            ticketID,
        } = this.props;

        return <Draggable draggableId={ 'ticket:' + column_id + ':' + ticketID } index={index}>
            { ( provided, snapshot ) => {
                const interceptOnClick = ( event ) => {
                    if ( provided.dragHandleProps ) {
                        provided.dragHandleProps.onClick( event );

                        if ( event.defaultPrevented ) return;
                    }

                    onClick( event );
                };

                // Makes dragged tickets look better
                const style = {
                    backgroundColor: snapshot.isDragging ? 'rgba( 255, 255, 255, 0.7 )' : 'white',
                    ...( provided.draggableProps.style ),
                    // Currently unneedded, but good future-proofing
                    ...( provided.dragHandleProps.style ),
                };

                return <React.Fragment>
                    <ListItem
                            button
                            ref={ ( node ) => provided.innerRef( node && ReactDOM.findDOMNode(node) ) }
                            { ...provided.draggableProps }
                            { ...provided.dragHandleProps }
                            onClick={interceptOnClick}
                            style={style}
                        >
                        <ListItemText
                            primary={ ticket ? ticket.Subject : "Loading..." }
                            secondary={ "#" + ticketID }
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
        const {
            classes,
            column: { column_id, tickets, name },
            canDrop = false,
            viewID,
        } = this.props;

        // We do a fair amount of work here to avoid keeping the dialogs inside the Droppable, to
        // avoid unnecessary rerenders.

        return <React.Fragment>
            { tickets.map( ticketID =>
                <TicketDialog
                    key={ticketID}
                    ticketID={ticketID}
                    open={this.state.openTicketID == ticketID}
                    onClose={ () => this.closeTicketDialog( ticketID ) }
                />
            ) }
            <Droppable droppableId={ `column:${viewID}:${column_id}` } isDropDisabled={!canDrop}>
                { ( provided, snapshot ) => 
                    <Card className={ snapshot.isDraggingOver ? classes.dragOver : null }>
                        <CardContent>
                            <Typography type="headline">{name}</Typography>
                            <div ref={ provided.innerRef }>
                                <List>
                                    { tickets.map( ( ticketID, index ) =>
                                        <TicketItem
                                            key={ticketID}
                                            index={index}
                                            column_id={column_id}
                                            ticketID={ticketID}
                                            onClick={ () => this.openTicketDialog( ticketID ) }
                                        />
                                    ) }
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
