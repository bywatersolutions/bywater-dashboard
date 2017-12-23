"use strict";

function extended( state, keys ) {
    return Object.assign( {}, state, keys );
}

function without( state, key ) {
    let { [key]: _, ...result } = state;

    return result;
}

export function user( state = null, action ) {
    switch ( action.type ) {
        case 'LOGGED_IN':
            return extended( state, {
                username: action.username,
            } );

        default:
            return state;
    }
}

export function errors( state = {}, action ) {
    switch ( action.type ) {
        case 'ERROR':
            return extended( state, {
                [action.payload]: true
            } );

        case 'IN_PROGRESS':
            return without( state, action.payload );

        default:
            return state;
    }
}

export function inProgress( state = {}, action ) {
    switch ( action.type ) {
        case 'IN_PROGRESS':
            return extended( state, {
                [action.payload]: true
            } );

        default:
            if ( state[action.payload] ) {
                return without( state, action.payload );
            } else {
                return state;
            }
    }
}
