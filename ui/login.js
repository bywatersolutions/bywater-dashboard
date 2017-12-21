"use strict";

import {
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    FormGroup,
    Grid,
    TextField
} from 'material-ui';
import React from 'react';
import { connect } from 'react-redux';

import * as actions from './actions';
import { styles } from './common';

class LoginPage extends React.Component {
    onLoginClick() {
        if ( !this.usernameInput || !this.usernameInput.value ) {
            return;
        }

        this.props.dispatch( actions.loggedIn( this.usernameInput.value ) );

        return false;
    }

    render() {
        return <div style={{
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                justifyContent: "space-around",
                padding: 20
            }}>
            <Grid container justify="center" alignItems="center">
                <Grid item xs={12} sm={8} lg={4}>
                    <Card>
                        <CardContent>
                            <form onSubmit={ () => this.onLoginClick() }>
                                <FormGroup><TextField inputRef={ el => this.usernameInput = el } label="Username" /></FormGroup>
                                <FormGroup><TextField inputRef={ el => this.passwordInput = el } label="Password" /></FormGroup>
                            </form>
                        </CardContent>
                        <CardActions>
                            <Button onClick={ () => this.onLoginClick() } raised color="primary">Log In</Button>
                        </CardActions>
                    </Card>
                </Grid>
            </Grid>
        </div>;
    }
}

export default connect()( LoginPage );
