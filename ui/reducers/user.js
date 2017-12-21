"use strict";

export default function user( state = null, action ) {
    switch ( action.type ) {
        case 'LOGGED_IN':
            return Object.assign( {}, state, {
                username: action.username,
            } );
        default:
            return state
    }
}
