import _ from 'lodash';

import { lookupColumn } from '../common';

function _apiFetch( method, url, request ) {
    return fetch( url, {
        method,
        credentials: 'same-origin',
        body: request && JSON.stringify( request ),
    } );
};
window._apiFetch = _apiFetch;

function _apiAction( {
    type,
    successfulType,
    method,
    path,
    pre = ( request, _getState ) => request,
    post = ( { response } ) => response.json(),
} ) {
    return ( request ) => ( async ( dispatch, getState ) => {
        let filteredRequest = pre( request, getState );

        if ( filteredRequest === false ) return;

        let realPath = path;
        if ( typeof path == 'function' ) realPath = path( request, getState );

        dispatch( { type: 'IN_PROGRESS', payload: { request, type } } );

        let response = await _apiFetch( method, realPath, filteredRequest );

        if ( response.ok ) {
            dispatch( {
                type: successfulType,
                payload: {
                    originalType: type,
                    request,
                    response,
                    result: await post( { request, response, dispatch } ),
                },
            } );
        } else {
            dispatch( { type: 'ERROR', payload: { request, type } } );
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

async function _postGetTickets( { response, dispatch } ) {
    let result = await response.json();

    let ticketIDs = _.flatMap( result.columns, column => column.tickets );

    dispatch( getTickets( { ids: ticketIDs } ) );

    return result;
}

export const getView = _apiAction( {
    type: 'GET_VIEW',
    successfulType: 'VIEW_FETCHED',
    method: 'GET',
    path: ( { viewID } ) => `/json/view/${viewID}`,
    pre: _request => null,

    post: _postGetTickets,
} );

export const getHistory = _apiAction( {
    type: 'GET_HISTORY',
    successfulType: 'HISTORY_FETCHED',
    method: 'POST',
    path: '/json/ticket/history',
} );

function _postMoveTicket( { request, response, dispatch } ) {
    dispatch( getHistory( { ticket_id: request.ticketID } ) );

    return response.json();
}

export const ticketMoveOwner = _apiAction( {
    type: 'TICKET_MOVE',
    successfulType: 'TICKET_UPDATED',
    method: 'POST',
    path: '/json/ticket/update',

    pre: request => ( {
        ticket_id: request.ticketID,
        Owner: request.rt_username,
    } ),
    post: _postMoveTicket,
} );

export const ticketMoveColumn = _apiAction( {
    type: 'TICKET_MOVE',
    successfulType: 'TICKET_UPDATED',
    method: 'POST',
    path: '/json/ticket/update',

    pre: ( request, getState ) => {
        let { views } = getState();

        let [ destinationViewID, destinationColumnID ] = request.destinationID;

        let column = lookupColumn( views[ destinationViewID ].columns, destinationColumnID );
        if ( !column ) return false;

        let dropAction = JSON.parse( column.drop_action );
        if ( _.isEmpty( dropAction ) ) return false;

        return {
            ticket_id: request.ticketID,
            ...dropAction,
        };
    },
    post: _postMoveTicket,
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
