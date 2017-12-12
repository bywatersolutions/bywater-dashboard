"use strict";

import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';

// Much of this file is spent gluing together react, redux and react-router.
import { Provider } from 'react-redux';
import createBrowserHistory from 'history/createBrowserHistory';
import { Route, Redirect } from 'react-router';
import * as ReactRouterRedux from 'react-router-redux';

import { composeWithDevTools } from 'redux-devtools-extension';

import './supportal.css';
import 'typeface-roboto';

import ToplevelContainer from './toplevel';
import LoginPage from './login';

const history = createBrowserHistory();
const routerMiddleware = ReactRouterRedux.routerMiddleware(history);
const store = createStore(
  combineReducers({
    router: ReactRouterRedux.routerReducer
  }),
  composeWithDevTools( applyMiddleware(routerMiddleware) )
);

console.log(Provider);
console.log(ReactRouterRedux);
console.log(ReactRouterRedux.ConnectedRouter);

ReactDOM.render(
  <Provider store={store}>
    <ReactRouterRedux.ConnectedRouter history={history}>
      <ToplevelContainer>
        <Route exact path="/" render={ () =>  <Redirect to={{ pathname: '/login' }} /> }/>
        <Route path="/login" component={LoginPage}/>
      </ToplevelContainer>
    </ReactRouterRedux.ConnectedRouter>
  </Provider>,
  document.getElementById('react-root')
);
