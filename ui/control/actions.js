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
window._apiDelay = 0;

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

        if ( window._apiDelay ) {
            await new Promise( resolve => setTimeout( resolve, window._apiDelay ) );
        }

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

    let ticketIDs = _.flatMap( Object.values( result ), column => column.tickets );

    dispatch( getTickets( { ids: ticketIDs } ) );

    return result;
}

export const getHistory = _apiAction( {
    type: 'GET_HISTORY',
    successfulType: 'HISTORY_FETCHED',
    method: 'POST',
    path: '/json/ticket/history',
} );

function _postRefreshTicket( { request, response, dispatch } ) {
    dispatch( getHistory( { ticket_id: request.ticketID || request.ticket_id } ) );

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
    post: _postRefreshTicket,
} );

export const ticketMoveColumn = _apiAction( {
    type: 'TICKET_MOVE',
    successfulType: 'TICKET_UPDATED',
    method: 'POST',
    path: '/json/ticket/update',

    pre: ( request, getState ) => {
        let { user: { views = [] } } = getState();

        let [ destinationViewID, destinationColumnID ] = request.destinationID;

        let view = views.find( ( { view_id } ) => view_id == destinationViewID );
        if ( !view ) return false;

        let column = lookupColumn( view.columns, destinationColumnID );
        if ( !column ) return false;

        let dropAction = JSON.parse( column.drop_action );
        if ( _.isEmpty( dropAction ) ) return false;

        return {
            ticket_id: request.ticketID,
            ...dropAction,
        };
    },
    post: _postRefreshTicket,
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

export const addTicketReply = _apiAction( {
    type: 'ADD_TICKET_REPLY',
    successfulType: 'TICKET_REPLY_ADDED',
    method: 'POST',
    path: '/json/ticket/add_correspondence',
    post: _postRefreshTicket,
} );

export const getColumnResults = _apiAction( {
    type: 'GET_COLUMN_RESULTS',
    successfulType: 'COLUMN_RESULTS_FETCHED',
    method: 'GET',
    path: ( { columnIDs } ) => `/json/column/${columnIDs.join( ',' )}/results`,
    pre: _request => null,

    post: _postGetTickets,
} );

export const saveViews = _apiAction( {
    type: 'SAVE_VIEWS',
    successfulType: 'VIEWS_SAVED',
    method: 'POST',
    path: '/json/view/',
} );
