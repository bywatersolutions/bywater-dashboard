"use strict";

import _ from 'lodash';

import { lookupColumn } from '../common';

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

function _apiAction( {
    type,
    successfulType,
    method,
    path,
    pre = ( body, getState ) => body,
    post = response => response.json(),
} ) {
    return ( body ) => ( async ( dispatch, getState ) => {
        let filteredBody = pre( body, getState );

        if ( filteredBody === false ) return;

        let realPath = path;
        if ( typeof path == "function" ) realPath = path( body, getState );

        dispatch( { type: 'IN_PROGRESS', payload: { request: body, type } } );

        let response = await _apiFetch( method, realPath, filteredBody );

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

export const getView = _apiAction( {
    type: 'GET_VIEW',
    successfulType: 'VIEW_FETCHED',
    method: 'GET',
    path: ({ viewID }) => `/json/view/${viewID}`,
    pre: body => null,

    post: _postGetTickets,
} );

export const getHistory = _apiAction( {
    type: 'GET_HISTORY',
    successfulType: 'HISTORY_FETCHED',
    method: 'POST',
    path: '/json/ticket/history',
} );

export const ticketMoveOwner = _apiAction( {
    type: 'TICKET_MOVE',
    successfulType: 'TICKET_UPDATED',
    method: 'POST',
    path: '/json/ticket/update',

    pre: ( body, getState ) => ( {
        ticket_id: body.ticket_id,
        Owner: body.rt_username,
    } ),
} );

export const ticketMoveColumn = _apiAction( {
    type: 'TICKET_MOVE',
    successfulType: 'TICKET_UPDATED',
    method: 'POST',
    path: '/json/ticket/update',

    pre: ( body, getState ) => {
        let { employee: { columns = {} }, lead: { columns: lead_columns = {} } } = getState();

        let column = lookupColumn( columns, body.destinationColumnID ) ||
            lookupColumn( lead_columns, body.destinationColumnID );
        if ( !column || !column.drag_action ) return false;

        return {
            ticket_id: body.ticket_id,
            ...column.drag_action
        };
    },
} );

export const getOldHistoryEntries = _apiAction( {
    type: 'GET_OLD_HISTORY_ENTRIES',
    successfulType: 'OLD_HISTORY_ENTRIES_FETCHED',
    method: 'POST',
    path: '/json/ticket/history_entries',
} );

export const getNewHistoryEntries = _apiAction( {
    type: 'GET_NEW_HISTORY_ENTRIES',
    successfulType: 'NEW_HISTORY_ENTRIES_FETCHED',
    method: 'POST',
    path: '/json/ticket/history_entries',
} );
