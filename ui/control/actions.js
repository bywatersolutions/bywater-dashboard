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
function _apiAction( { type, successfulType, method, path, pre = body => body, post = result => result } ) {
    return ( body ) => ( async dispatch => {
        dispatch( { type: 'IN_PROGRESS', payload: { request: body, type } } );

        let result = await _apiFetch( method, path, pre( body ) );

        if ( result.ok ) {
            dispatch( { type: successfulType, payload: { originalType: type, request: body, response: await result.text() } } );
        } else {
            dispatch( { type: 'ERROR', payload: { request: body, type } } );
        }
    } );
}

export const login = _apiAction( {
    type: 'LOGIN',
    successfulType: 'LOGGED_IN',
    method: 'POST',
    path: '/json/login',
} );

export const getDashboard = _apiAction( {
    type: 'GET_DASHBOARD',
    successfulType: 'DASHBOARD_FETCHED',
    method: 'GET',
    path: '/json/employee/tickets',
} );
