"use strict";

import React from 'react';

import { AppBar, Toolbar, Typography } from 'material-ui';
import { MuiThemeProvider } from 'material-ui/styles';

import { styles, theme } from './common';

export default class ToplevelContainer extends React.Component {
    render() {
        return <MuiThemeProvider theme={theme}>
            <div id="toplevel" style={{ height: "100vh" }}>
                <AppBar>
                    <Toolbar>
                        <Typography type="title" color="inherit" className={styles.flex}>BYWATER SUPPORTAL</Typography>
                    </Toolbar>
                </AppBar>
                {this.props.children}
            </div>
        </MuiThemeProvider>;
    }
}
