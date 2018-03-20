import _ from 'lodash';
import React from 'react';
import { Route, Redirect, Switch, withRouter } from 'react-router';
import { ConnectedRouter } from 'react-router-redux';

import {
    AppBar,
    Avatar,
    Button,
    Icon,
    Reboot,
    Snackbar,
    Tab,
    Tabs,
    Toolbar,
    Typography,
} from 'material-ui';
import Menu, { MenuItem } from 'material-ui/Menu';
import { MuiThemeProvider } from 'material-ui/styles';

import { connectWithStyles, theme, withOurStyles } from '../common';
import LoginPage from './login';
import TicketsView from './tickets-view';

import './material-icons.css';
import 'typeface-roboto';
import logoSrc from './images/bywater-logo.png';

@withOurStyles
class AccountButton extends React.Component {
    constructor( props ) {
        super( props );

        this.state = { menuOpenElem: null };
    }

    onClick = e => {
        this.setState( { menuOpenElem: e.target } );
    }

    onMenuClose = () => {
        this.setState( { menuOpenElem: null } );
    }

    render() {
        const { classes, user } = this.props;

        if ( _.isEmpty( user ) ) return null;

        return <Button color="inherit" onClick={this.onClick} ref={ el => this.buttonEl = el }>
            { user.avatar_url ?
                <Avatar component="span" className={classes.iconAdornment} src={user.avatar_url} /> :
                <Avatar component="span" className={classes.iconAdornment}>
                    {user.first_name[ 0 ] + user.last_name[ 0 ]}
                </Avatar>
            }
            {user.first_name} {user.last_name}
            <Menu
                anchorEl={this.state.menuOpenElem}
                anchorOrigin={ { horizontal: 'left', vertical: 'bottom' } }
                getContentAnchorEl={null}
                open={!!this.state.menuOpenElem}
                onClose={this.onMenuClose}
                >
                <MenuItem onClick={ () => window.location = '/logout' }>Log Out</MenuItem>
            </Menu>
        </Button>;
    }
}

@withRouter
@connectWithStyles( ( { user } ) => ( { user } ) )
class ToplevelToolbar extends React.Component {
    render() {
        const { classes, history, user, location, views, getSlug } = this.props;

        return <AppBar position="static">
            <Toolbar>
                <Typography type="title" className={classes.iconAdornment}><img src={logoSrc} /></Typography>
                <Typography type="title" color="inherit">PALANTIR</Typography>
                { !_.isEmpty( user ) && <Tabs
                        className={classes.topTabs}
                        value={location.pathname == '/' ? false : location.pathname}
                        onChange={ ( event, value ) => history.push( value ) }
                        indicatorColor="white"
                    >
                    { views.map( view =>
                        <Tab
                            key={ getSlug( view.name ) }
                            value={ '/' + getSlug( view.name ) }
                            label={ view.name }
                            />
                    ) }
                </Tabs> }
                <AccountButton user={user} />
            </Toolbar>
        </AppBar>;
    }
}

const handledErrors = [ 'LOGIN' ];

@connectWithStyles( ( { user, errors } ) => ( { user, errors } ) )
export default class ToplevelContainer extends React.Component {
    constructor( props ) {
        super( props );

        this.nameToSlug = {};
        this.slugToName = {};
    }

    getSlug = ( name ) => {
        if ( !this.nameToSlug[ name ] ) {
            let baseSlug = name.replace( /[^a-z0-9]+/gi, '-' ).replace( /^-+|-+$/, '' ).toLowerCase();
            let slug = baseSlug;

            let i = 1;

            while ( this.slugToName[ slug ] ) {
                slug = baseSlug + '-' + i;
                i++;
            }

            this.nameToSlug[ name ] = slug;
            this.slugToName[ slug ] = name;
        }

        return this.nameToSlug[ name ];
    }

    render() {
        const { classes, errors, history, user } = this.props;
        const isUnhandledError = Object.keys( errors ).some( error => !handledErrors.includes( error ) );

        return <MuiThemeProvider theme={theme}>
            <Reboot />
            <ConnectedRouter history={history}>
                <div id="toplevel" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                    overflow: 'hidden',
                }}>
                    <ToplevelToolbar views={user.views} getSlug={this.getSlug} />
                    { !_.isEmpty( user ) ? <Switch>
                        <Redirect exact from="/" to={'/' + this.getSlug( user.views[ 0 ].name )} />
                        { user.views.map( view => {
                            let slug = this.getSlug( view.name );
                            return <Route
                                key={slug}
                                exact
                                path={ '/' + slug }
                                render={() => <TicketsView viewInfo={view} />}
                            />;
                        } ) }
                    </Switch> : <LoginPage /> }
                </div>
            </ConnectedRouter>
            <Snackbar
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                SnackbarContentProps={{ classes: { root: classes.errorSnackbarRoot } }}
                open={ isUnhandledError }
                message={ 'An error has occurred, please reload the page to continue.' }
            />
        </MuiThemeProvider>;
    }
}
