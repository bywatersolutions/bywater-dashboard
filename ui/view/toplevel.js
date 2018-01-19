"use strict";

import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect, withRouter } from 'react-router';

import { AppBar, Icon, Tab, Tabs, Toolbar, Typography } from 'material-ui';
import { MuiThemeProvider } from 'material-ui/styles';

import { connectWithStyles, theme } from '../common';
import LoginPage from './login';
import MyTickets from './my-tickets';

import './supportal.css';
import 'typeface-roboto';
import logoSrc from './images/bywater-logo.png';

const ToplevelToolbar = connectWithStyles( store => ( { username: store.user.username } ) )( withRouter( ( { classes, username, location } ) => (
    <AppBar position="static">
        <Toolbar>
            <Typography type="title" className={classes.iconAdornment}><img src={logoSrc} /></Typography>
            <Typography type="title" color="inherit">PALANTIR</Typography>
            { username && <Tabs
                    className={classes.topTabs}
                    value={location.pathname}
                    indicatorColor="white">
                <Tab value="/" label="MY TICKETS" />
            </Tabs> }
            { username && <Typography type="subheading" color="inherit"><Icon className={classes.iconAdornment}>account_circle</Icon>{username}</Typography> }
        </Toolbar>
    </AppBar>
) ) );

let PrivateRoute = connect( ( { user } ) => ( { user } ) )( ( { component: Component, user, ...rest } ) => (
    <Route {...rest} render={ props => (
        user.username ? <Component {...props} /> : <LoginPage />
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
