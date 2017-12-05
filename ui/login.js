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

import { styles } from './common';

export default class LoginPage extends React.Component {
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
                            <form>
                                <FormGroup><TextField label="Username" /></FormGroup>
                                <FormGroup><TextField label="Password" /></FormGroup>
                            </form>
                        </CardContent>
                        <CardActions>
                            <Button raised color="primary">Log In</Button>
                        </CardActions>
                    </Card>
                </Grid>
            </Grid>
        </div>;
    }
}
