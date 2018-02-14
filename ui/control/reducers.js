"use strict";

import produce from 'immer';

export function user( state = {}, action ) {
    return produce( state, draft => {
        switch ( action.type ) {
            case 'LOGGED_IN':
                draft.username = action.payload.request.login;
                break;
        }
    } );
}

export function employee( state = {}, { type, payload } ) {
    return produce( state, draft => {
        switch ( type ) {
            case 'DASHBOARD_FETCHED':
                for ( let key of [ 'columns', 'custom_fields', 'popup_config', 'queues', 'rt_users', 'statuses' ] ) {
                    draft[key] = payload.result[key];
                }
                break;
        }
    } );
}

export function lead( state = {}, { type, payload } ) {
    return produce( state, draft => {
        switch ( type ) {
            case 'LEAD_DASHBOARD_FETCHED':
                for ( let key of [ 'columns', 'users' ] ) {
                    draft[key] = payload.result[key];
                }
                break;
        }
    } );
}

export function tickets( state = {}, { type, payload } ) {
    return produce( state, draft => {
        switch ( type ) {
            case 'TICKETS_FETCHED':
                for ( let ticketID in payload.result ) {
                    draft[ticketID] = payload.result[ticketID];
                }
                break;

            case 'HISTORY_FETCHED':
                draft[ payload.request.ticket_id ].history = payload.result;
        }
    } );
}

export function errors( state = {}, action ) {
    return produce( state, draft => {
        switch ( action.type ) {
            case 'ERROR':
                draft[action.payload.type] = true;
                break;

            case 'IN_PROGRESS':
                delete draft[action.payload.type];
                break;
        }
    } );
}

export function inProgress( state = {}, action ) {
    return produce( state, draft => {
        switch ( action.type ) {
            case 'IN_PROGRESS':
                draft[action.payload.type] = true;
                break;

            case 'ERROR':
                delete draft[action.payload.type];
                break;

            default:
                if ( action.payload && action.payload.originalType ) {
                    delete draft[action.payload.originalType];
                }
        }
    } );
}
