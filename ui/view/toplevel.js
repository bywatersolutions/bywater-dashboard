"use strict";

import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router';

import { AppBar, Icon, Toolbar, Typography } from 'material-ui';
import { MuiThemeProvider } from 'material-ui/styles';

import { connectWithStyles, theme } from '../common';
import LoginPage from './login';
import MyTickets from './my-tickets';

import './supportal.css';
import 'typeface-roboto';
import logoSrc from './images/bywater-logo.png';

const ToplevelToolbar = connectWithStyles( store => ( { username: store.user && store.user.username } ) )( ( { classes, username } ) => (
    <AppBar>
        <Toolbar>
            <Typography type="title" className={classes.iconAdornment}><img src={logoSrc} /></Typography>
            <Typography type="title" color="inherit" className={classes.flex}>BYWATER SUPPORTAL</Typography>
            { username && <Typography type="subheading" color="inherit"><Icon className={classes.iconAdornment}>account_circle</Icon>{username}</Typography> }
        </Toolbar>
    </AppBar>
) );

let PrivateRoute = connect( ( { user } ) => ( { user } ) )( ( { component: Component, user, ...rest } ) => (
    <Route {...rest} render={ props => (
        user ? <Component {...props} /> : <LoginPage />
    ) } />
) );

export default class ToplevelContainer extends React.Component {
    render() {
        return <MuiThemeProvider theme={theme}>
            <div id="toplevel" style={{ height: "100vh" }}>
                <ToplevelToolbar />
                <PrivateRoute exact path="/" component={MyTickets} />
            </div>
        </MuiThemeProvider>;
    }
}
