"use strict";

import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';

// Much of this file is spent gluing together react, redux and react-router.
import { Provider } from 'react-redux';
import createBrowserHistory from 'history/createBrowserHistory';
import * as ReactRouterRedux from 'react-router-redux';
import thunkMiddleware from 'redux-thunk';

import { composeWithDevTools } from 'redux-devtools-extension';

import ToplevelContainer from './view/toplevel';
import * as reducers from './control/reducers';

const history = createBrowserHistory();
const routerMiddleware = ReactRouterRedux.routerMiddleware(history);
const store = createStore(
    combineReducers({
        router: ReactRouterRedux.routerReducer,
        ...reducers,
    }),
    composeWithDevTools( applyMiddleware( routerMiddleware, thunkMiddleware ) )
);

ReactDOM.render(
    <Provider store={store}>
        <ToplevelContainer history={history} />
    </Provider>,
    document.getElementById('react-root')
);
