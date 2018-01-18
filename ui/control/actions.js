"use strict";

function sleep( length ) {
    return new Promise( resolve => setTimeout( resolve, length ) );
}

window._apiFetch = function _apiFetch( method, url, body ) {
    return fetch( url, {
        method,
        credentials: 'same-origin',
        body: body && JSON.stringify( body ),
    } );
};

export function login( username, password ) {
    return async dispatch => {
        dispatch( { type: 'IN_PROGRESS', payload: 'LOGIN' } );

        let result = await _apiFetch( 'POST', '/json/login', { login: username } );

        if ( result.ok ) {
            dispatch( { type: 'LOGGED_IN', username } );
        } else {
            dispatch( { type: 'ERROR', payload: 'LOGIN' } );
        }
    }
}
