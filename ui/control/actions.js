"use strict";

import _ from 'lodash';

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

function _apiAction( { type, successfulType, method, path, pre = body => body, post = response => response.json() } ) {
    return ( body ) => ( async dispatch => {
        dispatch( { type: 'IN_PROGRESS', payload: { request: body, type } } );

        let response = await _apiFetch( method, path, pre( body ) );

        if ( response.ok ) {
            dispatch( { type: successfulType, payload: { originalType: type, request: body, response, result: await post( response, dispatch ) } } );
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

export const getTickets = _apiAction( {
    type: 'GET_TICKETS',
    successfulType: 'TICKETS_FETCHED',
    method: 'POST',
    path: '/json/ticket/details',
} );

async function _postGetTickets( response, dispatch ) {
    let result = await response.json();

    let ticketIDs = _.flatMap( result.columns, column => column.tickets );

    dispatch( getTickets( { ids: ticketIDs } ) );

    return result;
}

export const getDashboard = _apiAction( {
    type: 'GET_DASHBOARD',
    successfulType: 'DASHBOARD_FETCHED',
    method: 'GET',
    path: '/json/employee/tickets',

    post: _postGetTickets,
} );

export const getLeadDashboard = _apiAction( {
    type: 'GET_LEAD_DASHBOARD',
    successfulType: 'LEAD_DASHBOARD_FETCHED',
    method: 'GET',
    path: '/json/lead/tickets',

    post: _postGetTickets,
} );

export const getHistory = _apiAction( {
    type: 'GET_HISTORY',
    successfulType: 'HISTORY_FETCHED',
    method: 'POST',
    path: '/json/ticket/history',
} );
