import produce from 'immer';

import { lookupColumn } from '../common';

let userInitialState = window.EXISTING_USER_INFO || {};

export function user( state = userInitialState, { type, payload } ) {
    return produce( state, draft => {
        switch ( type ) {
            case 'LOGGED_IN':
                for ( let key of [
                    'rt_username',
                    'real_name',
                    'avatar_url',
                    'custom_fields',
                    'popup_config',
                    'queues',
                    'users',
                    'views',
                    'statuses',
                ] ) {
                    draft[ key ] = payload.result.user_info[ key ];
                }

                break;
        }
    } );
}

export function views( state = {}, { type, payload } ) {
    return produce( state, draft => {
        switch ( type ) {
            case 'VIEW_FETCHED':
                draft[ payload.request.viewID ] = { columns: payload.result.columns };
                break;

            // We optimistically add the ticket to the column, for quick feedback.
            // If we need to, we'll just refresh the page on error.
            case 'IN_PROGRESS':
                if ( payload.type == 'TICKET_MOVE' && payload.request.destinationID.length == 2 ) {
                    let [ destinationViewID, destinationColumnID ] = payload.request.destinationID;

                    let column = lookupColumn(
                        draft[ destinationViewID ].columns, destinationColumnID,
                    );
                    if ( !column ) return;

                    let prevIndex = column.tickets.indexOf( payload.request.ticketID );
                    if ( prevIndex != -1 ) {
                        column.tickets.splice( prevIndex, 1 );
                    }

                    column.tickets.splice( payload.request.destinationColumnIndex, 0, payload.request.ticketID );
                }
                break;
        }
    } );
}

export function tickets( state = {}, { type, payload } ) {
    let history;

    return produce( state, draft => {
        switch ( type ) {
            case 'TICKETS_FETCHED':
                for ( let ticketID in payload.result ) {
                    draft[ ticketID ] = payload.result[ ticketID ];
                }

                break;

            case 'HISTORY_FETCHED':
                draft[ payload.request.ticket_id ].history = payload.result;
                break;

            case 'OLD_HISTORY_ENTRIES_FETCHED':
                history = draft[ payload.request.ticket_id ].history;
                history.unloaded.splice( 0, payload.result.length );
                history.old.push( ...payload.result );
                break;

            case 'NEW_HISTORY_ENTRIES_FETCHED':
                history = draft[ payload.request.ticket_id ].history;
                history.unloaded.splice( -payload.result.length );
                history.new.unshift( ...payload.result );
                break;
        }
    } );
}

export function errors( state = {}, action ) {
    return produce( state, draft => {
        switch ( action.type ) {
            case 'ERROR':
                draft[ action.payload.type ] = true;
                break;

            case 'IN_PROGRESS':
                delete draft[ action.payload.type ];
                break;
        }
    } );
}

export function inProgress( state = {}, action ) {
    return produce( state, draft => {
        switch ( action.type ) {
            case 'IN_PROGRESS':
                draft[ action.payload.type ] = true;
                break;

            case 'ERROR':
                delete draft[ action.payload.type ];
                break;

            default:
                if ( action.payload && action.payload.originalType ) {
                    delete draft[ action.payload.originalType ];
                }

        }
    } );
}
