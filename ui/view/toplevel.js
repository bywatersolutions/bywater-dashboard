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
import TicketsView from './tickets-view';

import './supportal.css';
import 'typeface-roboto';
import logoSrc from './images/bywater-logo.png';

@withRouter
@connectWithStyles( ( { user } ) => ( { user } ) )
class ToplevelToolbar extends React.Component {
    render() {
        const { classes, history, user, location, views, getSlug } = this.props;

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
                    { views.map( view =>
                        <Tab
                            key={ getSlug(view.name) }
                            value={ '/' + getSlug(view.name) }
                            label={ view.name }
                            />
                    ) }
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
    constructor( props ) {
        super(props);

        this.nameToSlug = {};
        this.slugToName = {};
    }

    getSlug = ( name ) => {
        if ( !this.nameToSlug[name] ) {
            let baseSlug = name.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/, '').toLowerCase();
            let slug = baseSlug;

            let i = 1;

            while ( this.slugToName[slug] ) {
                slug = baseSlug + '-' + i;
                i++;
            }

            this.nameToSlug[name] = slug;
            this.slugToName[slug] = name;
        }

        return this.nameToSlug[name];
    }

    render() {
        const { classes, errors, history, user } = this.props;
        const isUnhandledError = Object.keys( errors ).some( error => !handledErrors.includes( error ) );

        return <MuiThemeProvider theme={theme}>
            <Reboot />
            <ConnectedRouter history={history}>
                <div id="toplevel" style={{ height: "100vh" }}>
                    <ToplevelToolbar views={user.views} getSlug={this.getSlug} />
                    { user.username ? <Switch>
                        <Redirect exact from="/" to={'/' + this.getSlug( user.views[0].name )} />
                        { user.views.map( view => {
                            let slug = this.getSlug( view.name );
                            return <Route
                                key={slug}
                                exact
                                path={ '/' + slug }
                                component={TicketsView}
                                viewInfo={view}
                            />;
                        } ) }
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
