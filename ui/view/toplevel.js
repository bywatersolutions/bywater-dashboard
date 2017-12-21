"use strict";

import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router';

import { AppBar, Icon, Toolbar, Typography } from 'material-ui';
import { MuiThemeProvider, withStyles } from 'material-ui/styles';

import { styles, theme } from '../common';
import LoginPage from './login';

import './supportal.css';
import 'typeface-roboto';
import logoSrc from './images/bywater-logo.png';

const ToplevelToolbar = withStyles( styles )( ( { classes, username } ) => (
    <AppBar>
        <Toolbar>
            <Typography type="title" className={classes.iconAdornment}><img src={logoSrc} /></Typography>
            <Typography type="title" color="inherit" className={classes.flex}>BYWATER SUPPORTAL</Typography>
            { username && <Typography type="subheading" color="inherit"><Icon className={classes.iconAdornment}>account_circle</Icon>{username}</Typography> }
        </Toolbar>
    </AppBar>
) );

class ToplevelContainer extends React.Component {
    render() {
        return <MuiThemeProvider theme={theme}>
            <div id="toplevel" style={{ height: "100vh" }}>
                <ToplevelToolbar username={ this.props.username } />
                <Route exact path="/" render={ () => <Redirect to={{ pathname: '/login' }} /> }/>
                <Route path="/login" component={LoginPage}/>
            </div>
        </MuiThemeProvider>;
    }
}

export default connect( store => ( {
    username: store.user && store.user.username
} ) )( ToplevelContainer );
