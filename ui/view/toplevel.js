import _ from 'lodash';
import React from 'react';
import { Route, Redirect, Switch, withRouter } from 'react-router';
import { ConnectedRouter } from 'react-router-redux';

import {
    AppBar,
    Avatar,
    Button,
    Fade,
    Hidden,
    Icon,
    CssBaseline,
    Snackbar,
    Tab,
    Tabs,
    Toolbar,
    Typography,
} from 'material-ui';
import Menu, { MenuItem } from 'material-ui/Menu';
import { MuiThemeProvider } from 'material-ui/styles';
import withWidth, { isWidthUp, isWidthDown } from 'material-ui/utils/withWidth';

import { connectWithStyles, theme, withOurStyles } from '../common';
import LoginPage from './login';
import TicketsView from './tickets-view';
import SettingsDialog from './components/settings-dialog';

import 'material-design-icons-iconfont/dist/material-design-icons.css';
import 'typeface-roboto';
import logoSrc from './images/bywater-logo.png';

@withOurStyles
@withWidth()
class AccountButton extends React.Component {
    constructor( props ) {
        super( props );

        this.state = { menuOpenElem: null, settingsOpen: false };
    }

    onClick = e => {
        this.setState( { menuOpenElem: this.state.menuOpenElem ? null : e.currentTarget } );
    }

    onMenuClose = () => {
        this.setState( { menuOpenElem: null } );
    }

    onLogout = () => {
        window.location = '/logout'
    }

    onSettings = () => {
        this.setState( { settingsOpen: true } );
    }

    render() {
        const { classes, user, width } = this.props;

        if ( _.isEmpty( user ) ) return null;

        // Is width Less than or Equal, or Greater than or Equal
        const wLe = breakpoint => isWidthDown( breakpoint, width );
        const wGe = breakpoint => isWidthUp( breakpoint, width );
        const realNameParts = user.real_name.split( ' ' );
        const initials = realNameParts[ 0 ][ 0 ] + (
            realNameParts.length > 1 ?
            realNameParts[ realNameParts.length - 1 ][ 0 ] :
            ''
        );

        return <React.Fragment>
                <Button
                    color="inherit"
                    onClick={this.onClick}
                    ref={ el => this.buttonEl = el }
                    style={ wLe( 'sm' ) ? { minWidth: 40, padding: 0 } : null }
                >
                { user.avatar_url ?
                    <Avatar component="span" className={classes.iconAdornment} src={user.avatar_url} /> :
                    <Avatar component="span" className={classes.iconAdornment}>
                        {initials}
                    </Avatar>
                }
                { wGe( 'md' ) && <span>{user.real_name}</span> }
                <Icon>expand_more</Icon>
            </Button>
            <Menu
                    anchorEl={this.state.menuOpenElem}
                    anchorOrigin={ { horizontal: 'right', vertical: 'bottom' } }
                    transformOrigin={ { horizontal: 'right', vertical: 'top' } }
                    // Necessary in order to provide above, overrides unneeded select-box
                    // functionality in <Menu>
                    getContentAnchorEl={null}
                    open={!!this.state.menuOpenElem}
                    onClose={this.onMenuClose}
                >
                { wLe( 'sm' ) && <MenuItem button={false}>{user.real_name}</MenuItem> }
                { wLe( 'md' ) && <MenuItem onClick={this.onSettings}>Settings</MenuItem> }
                { wLe( 'md' ) && <MenuItem onClick={this.onLogout}>Log Out</MenuItem> }
            </Menu>
            { wGe( 'lg' ) && <React.Fragment>
                <Button onClick={this.onSettings} color="inherit">
                    <Icon className={classes.iconAdornment}>settings</Icon>
                    <span>Settings</span>
                </Button>
                <Button onClick={this.onLogout} color="inherit">
                    <Icon className={classes.iconAdornment}>exit_to_app</Icon>
                    <span>Log Out</span>
                </Button>
            </React.Fragment> }
            <SettingsDialog
                open={this.state.settingsOpen}
                onClose={ () => this.setState( { settingsOpen: false } ) }
                />
        </React.Fragment>;
    }
}

@withRouter
@connectWithStyles( ( { user } ) => ( { user } ) )
class ToplevelToolbar extends React.Component {
    render() {
        const { classes, history, user, location, views, getSlug } = this.props;

        return <AppBar position="static">
            <Toolbar>
                <Typography variant="title" color="inherit">
                    <img src={logoSrc} className={classes.iconAdornment} />
                    <Hidden smDown={ !_.isEmpty( user ) }><span>PALANTIR</span></Hidden>
                </Typography>
                { !_.isEmpty( user ) && <Tabs
                        className={classes.topTabs}
                        value={location.pathname == '/' ? false : location.pathname}
                        onChange={ ( event, value ) => history.push( value ) }
                        indicatorColor="white"
                        scrollable
                        scrollButtons="on"
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
            <CssBaseline />
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
                                render={() => <Fade in={true}><TicketsView view={view} /></Fade>}
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
