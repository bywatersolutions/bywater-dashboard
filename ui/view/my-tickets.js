"use strict";

import { Card, CardContents, CardHeader, Grid, Typography } from 'material-ui';
import React from 'react';

import { connectWithStyles } from '../common';

export default connectWithStyles()( function MyTickets( { classes } ) {
    let columns = [ { title: "My TODO" }, { title: "Waiting" } ];

    return <div className={ classes.page }>
        <Grid container spacing={24}>
            { columns.map( column => <Grid item xs={12} sm={4} md={2} key={column.title}>
                <Card>
                    <CardHeader title={column.title} />
                </Card>
            </Grid> ) }
        </Grid>
    </div>;
} );
