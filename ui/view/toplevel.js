"use strict";

import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect, Switch, withRouter } from 'react-router';
import { ConnectedRouter } from 'react-router-redux';

import {
    AppBar,
    Backdrop,
    Icon,
    Portal,
    Reboot,
    Snackbar,
    Tab,
    Tabs,
    Toolbar,
    Typography,
} from 'material-ui';
import { MuiThemeProvider } from 'material-ui/styles';

import { connectWithStyles, theme } from '../common';
import LoginPage from './login';
import MyTickets from './my-tickets';
import AssignTickets from './assign-tickets';

import './supportal.css';
import 'typeface-roboto';
import logoSrc from './images/bywater-logo.png';

@withRouter
@connectWithStyles( ( { user } ) => ( { user } ) )
class ToplevelToolbar extends React.Component {
    render() {
        const { classes, history, user, location } = this.props;

        return <AppBar position="static">
            <Toolbar>
                <Typography type="title" className={classes.iconAdornment}><img src={logoSrc} /></Typography>
                <Typography type="title" color="inherit">PALANTIR</Typography>
                { user.username && <Tabs
                        className={classes.topTabs}
                        value={location.pathname}
                        onChange={ ( event, value ) => history.push( value ) }
                        indicatorColor="white"
                    >
                    <Tab value="/" label="MY TICKETS" />
                    <Tab value="/assign" label="ASSIGN TICKETS" />
                    <Tab value="/reports" label="REPORTS" />
                </Tabs> }
                { user.username && <Typography type="subheading" color="inherit">
                    <Icon className={classes.iconAdornment}>account_circle</Icon>
                    {user.first_name} {user.last_name}
                </Typography> }
            </Toolbar>
        </AppBar>;
    }
}

const handledErrors = [ 'LOGIN' ];

@connectWithStyles( ( { user, errors } ) => ( { user, errors } ) )
export default class ToplevelContainer extends React.Component {
    renderPrivateRoute( path, Component ) {
        return <Route exact path={path} render={ props => (
            this.props.user.username ? <Component {...props} /> : <LoginPage />
        ) } />;
    }

    render() {
        const { classes, errors, history, user } = this.props;
        const isUnhandledError = Object.keys( errors ).some( error => !handledErrors.includes( error ) );

        return <MuiThemeProvider theme={theme}>
            <Reboot />
            <ConnectedRouter history={history}>
                <div id="toplevel" style={{ height: "100vh" }}>
                    <ToplevelToolbar />
                    { user.username ? <Switch>
                        <Route exact path="/" component={MyTickets} />
                        <Route exact path="/assign" component={AssignTickets} />
                    </Switch> : <LoginPage /> }
                </div>
            </ConnectedRouter>
            <Snackbar
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                SnackbarContentProps={{ classes: { root: classes.errorSnackbarRoot } }}
                open={ isUnhandledError }
                message={ "An error has occurred, please reload the page to continue." }
            />
        </MuiThemeProvider>;
    }
}
