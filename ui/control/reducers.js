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

export function employee( state = {}, action ) {
    return produce( state, draft => {
        switch ( action.type ) {
            case 'DASHBOARD_FETCHED':
                let response = JSON.parse( action.payload.response );

                for ( let key of [ 'columns', 'custom_fields', 'popup_config', 'queues', 'rt_users', 'statuses' ] ) {
                    draft[key] = response[key];
                }
                break;
        }
    } );
}

export function tickets( state = {}, action ) {
    return state;
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
