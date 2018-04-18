// Dialog view for a single ticket.

import {
    Card,
    CardContent,
    Icon,
    IconButton,
    Typography,
} from 'material-ui';

import Table, {
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from 'material-ui/Table';

import React from 'react';
import { connect } from 'react-redux';

import * as actions from '../../control/actions';

import TabbedDialog, {
    TabbedDialogContent,
} from './tabbed-dialog';

class ViewSettings extends React.PureComponent {
    render() {
        const { view } = this.props;

        return <Card style={{ marginTop: 16 }} elevation={2}>
            <CardContent>
                <Typography variant="title">{ view.name }</Typography>
            </CardContent>
        </Card>;
    }
}

@connect(
    ( { user, inProgress } ) => ( {
        inProgress: inProgress.SAVE_SETTINGS,
        user,
    } )
)
export default class SettingsDialog extends React.Component {
    render() {
        const {
            open,
            onClose,
            user: { views = [] },
        } = this.props;

        return <TabbedDialog
                open={open}
                onClose={onClose}
                title="Settings"
                extraButtons={[
                    <IconButton
                            key="save"
                            aria-label="Save"
                            color="primary"
                            onClick={this.onClickSave}
                        >
                        <Icon style={ { verticalAlign: 'bottom' } }>done</Icon>
                    </IconButton>,
                ]}
                tabNames={[ 'VIEWS', 'GENERAL' ]}
        >
            <TabbedDialogContent>
                <div>
                    { views.map( view =>
                        <ViewSettings
                            key={view.view_id}
                            view={view}
                        />
                    ) }
                </div>
                <Typography>OTHER</Typography>
            </TabbedDialogContent>
        </TabbedDialog>;
    }
}
