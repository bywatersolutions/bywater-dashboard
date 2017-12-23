"use strict";

function sleep( length ) {
    return new Promise( resolve => setTimeout( resolve, length ) );
}

export function login( username, password ) {
    return async dispatch => {
        dispatch( { type: 'IN_PROGRESS', payload: 'LOGIN' } );

        await sleep( 3000 );

        let result = await fetch( '/json/login', {
            method: 'POST',
            body: JSON.stringify( { login: username } ),
        } );

        if ( result.ok ) {
            dispatch( { type: 'LOGGED_IN', username } );
        } else {
            dispatch( { type: 'ERROR', payload: 'LOGIN' } );
        }
    }
}
