// Dialog view for a single ticket.

import {
    AppBar,
    Icon,
    IconButton,
    Tab,
    Tabs,
    Toolbar,
    Typography,
} from 'material-ui';

import Dialog, {
    DialogContent,
    withMobileDialog,
} from 'material-ui/Dialog';

import Table, {
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from 'material-ui/Table';

const MobileDialog = withMobileDialog( { breakpoint: 'sm' } )( Dialog );

import React from 'react';
import { connect } from 'react-redux';
import SwipeableViews from 'react-swipeable-views';

import { connectWithStyles } from '../../common';
import * as actions from '../../control/actions';

@connect( ( { user: { views = {} } }, { viewID } ) => ( { view: views[ viewID ] } ) )
class ViewSettings extends React.PureComponent {
    render() {
        const { view, viewName } = this.props;

        return <div>{ viewName }</div>
    }
}

@connectWithStyles(
    ( { user, inProgress } ) => ( {
        inProgress: inProgress.SAVE_SETTINGS,
        user,
    } )
)
export default class SettingsDialog extends React.Component {
    state = {
        tab: 0,
    };

    render() {
        const {
            classes,
            open,
            onClose,
            user: { views = {} },
        } = this.props;

        return <MobileDialog
                classes={{ paper: classes.fixedDialogPaper }}
                maxWidth={false}
                open={open}
                onClose={onClose}
                aria-labelledby="ticket-dialog-title"
            >
            <AppBar color="default" position="static">
                <Toolbar disableGutters={true}>
                    <IconButton
                            aria-label="Close"
                            color="secondary"
                            onClick={onClose}
                        >
                        <Icon style={ { verticalAlign: 'bottom' } }>close</Icon>
                    </IconButton>
                    <Typography
                            id="ticket-dialog-title"
                            type="title"
                            color="inherit"
                            style={{ flex: 1 }}
                        >
                        Settings
                    </Typography>
                </Toolbar>
                <Tabs
                        value={this.state.tab}
                        indicatorColor="black"
                        onChange={ ( event, tab ) => this.setState( { tab } ) }
                        centered
                        fullWidth
                    >
                    <Tab label="DASHBOARDS" />
                    <Tab label="OTHER" />
                </Tabs>
            </AppBar>
            <DialogContent>
                <SwipeableViews
                    disableLazyLoading={true}
                    index={this.state.tab}
                    onChangeIndex={ tab => this.setState( { tab } ) }
                    style={{ height: '100%' }}
                    containerStyle={{ height: '100%' }}
                >
                    <div>
                        { Object.values( views ).map( ( { view_id, name } ) =>
                            <ViewSettings
                                key={view_id}
                                view_id={ view_id }
                                viewName={name}
                            />
                        ) }
                    </div>
                    <Typography>OTHER</Typography>
                </SwipeableViews>
            </DialogContent>
        </MobileDialog>;
    }
}
