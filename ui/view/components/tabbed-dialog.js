import {
    AppBar,
    Icon,
    IconButton,
    Paper,
    Tab,
    Tabs,
    Toolbar,
    Typography,
} from 'material-ui';

import Dialog, {
    DialogContent,
    withMobileDialog,
} from 'material-ui/Dialog';

const MobileDialog = withMobileDialog( { breakpoint: 'sm' } )( Dialog );

import React from 'react';
import SwipeableViews from 'react-swipeable-views';

import { withOurStyles } from '../../common';

export class TabbedDialogContent extends React.PureComponent {
    render() {
        const { children, onChangeIndex, tab } = this.props;

        return <DialogContent style={{
            display: 'flex',
            flexDirection: 'column',
            paddingLeft: 16,
            paddingBottom: 0,
            paddingRight: 16,
        }}>
            <SwipeableViews
                disableLazyLoading={true}
                index={tab}
                onChangeIndex={onChangeIndex}
                style={{ height: '100%' }}
                containerStyle={{ height: '100%' }}
            >
                {children}
            </SwipeableViews>
        </DialogContent>
    }
}

export class TabbedDialogFooter extends React.PureComponent {
    render() {
        return <Paper elevation={8} component="footer" style={{ zIndex: 1100 }}>
            {this.props.children}
        </Paper>;
    }
}

@withOurStyles
export default class TabbedDialog extends React.Component {
    state = {
        tab: 0,
    };

    render() {
        const {
            classes,
            extraButtons,
            onClose,
            open,
            tabNames,
            title,
        } = this.props;

        const { tab } = this.state;

        return <MobileDialog
                classes={{ paper: classes.fixedDialogPaper }}
                maxWidth={false}
                open={open}
                onClose={onClose}
                aria-labelledby="dialog-title"
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
                            id="dialog-title"
                            variant="title"
                            color="inherit"
                            style={{ flex: 1 }}
                        >
                        {title}
                    </Typography>
                    {extraButtons}
                </Toolbar>
                <Tabs
                        value={tab}
                        indicatorColor="black"
                        onChange={ ( event, newTab ) => this.setState( { tab: newTab } ) }
                        centered
                        fullWidth
                    >
                    { tabNames.map( name => <Tab key={name} label={name} /> ) }
                </Tabs>
            </AppBar>
            {React.Children.map( this.props.children, child =>
                child.type == TabbedDialogContent ?
                React.cloneElement( child, {
                    onChangeIndex: newTab => this.setState( { tab: newTab } ),
                    tab,
                } ) :
                child
            )}
        </MobileDialog>;
    }
}
