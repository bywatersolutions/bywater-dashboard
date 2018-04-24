// Dialog view for a single ticket.

import _ from 'lodash';

import produce from 'immer';

import {
    Card,
    CardContent,
    FormControl,
    Icon,
    IconButton,
    TextField,
    Typography,
} from 'material-ui';

import ExpansionPanel, {
    ExpansionPanelSummary,
    ExpansionPanelDetails,
} from 'material-ui/ExpansionPanel';

import React from 'react';
import { connect } from 'react-redux';

import { connectWithStyles } from '../../common';
import * as actions from '../../control/actions';

import TabbedDialog, {
    TabbedDialogContent,
} from './tabbed-dialog';

@connectWithStyles(
    ( { user: { views = [] } }, { viewID } ) => ( {
        view: views.find( view => view.view_id == viewID ),
    } )
)
class ViewSettings extends React.Component {
    constructor( props ) {
        super( props );

        this.state = this.getStateFromProps( props );
    }

    reSortColumns( columns ) {
        columns.sort( ( a, b ) => a.column_order - b.column_order );

        let i = 1;
        for ( let column of columns ) column.column_order = i++;
    }

    getStateFromProps( { view } ) {
        let ownView = JSON.parse( JSON.stringify( view ) );

        this.reSortColumns( ownView.columns );

        return { view: ownView };
    }

    componentWillReceiveProps( newProps ) {
        if ( ( newProps.dialogOpen && !this.props.dialogOpen ) ) {
            this.setState( this.getStateFromProps( newProps ) );
        }
    }

    onViewUpdate( updater ) {
        this.setState( state => {
            let newView = produce( state.view, draft => {
                // We don't just pass `updater` to `produce` because Immer gets grumpy when the
                // updater returns a value (which will happen with something like `draft =>
                // draft.name = "potato"`).
                updater( draft )
            } );

            this.props.onViewUpdate( newView );

            return { view: newView };
        } );
    }

    render() {
        const { classes } = this.props;

        const { view } = this.state;

        const viewPropControl = ( {
            control: Control = TextField,
            key,
            variant,
            ...rest
        } ) =>
            <Control
                className={ variant && classes[ 'textField' + variant ] }
                value={ view[ key ] }
                onChange={ e => {
                    // We have to pull this out because the React synthetic event may be recycled
                    // before the updater is called
                    const newValue = e.target.value;

                    this.onViewUpdate( draft => draft[ key ] = newValue );
                } }
                {...rest}
            />;

        const columnPropControl = ( {
            control: Control = TextField,
            i,
            key,
            variant,
            afterChangeUpdater = _draft => {},
            ...rest
        } ) =>
            <Control
                className={ variant && classes[ 'textField' + variant ] }
                value={ view.columns[ i ][ key ] }
                onChange={ e => {
                    // We have to pull this out because the React synthetic event may be recycled
                    // before the updater is called
                    const newValue = e.target.value;

                    this.onViewUpdate( draft => {
                        let oldValue = draft.columns[ i ][ key ];
                        draft.columns[ i ][ key ] = newValue;
                        afterChangeUpdater( draft, { newValue, oldValue } );
                    } );
                } }
                {...rest}
            />;

        return <Card style={{ marginTop: 16 }} elevation={2}>
            <CardContent>
                <FormControl style={{ marginBottom: 16 }}>
                    { viewPropControl( {
                        variant: 'Title',
                        key: 'name',
                        label: 'Title',
                    } ) }
                </FormControl>
                { view.columns.map( ( column, i ) =>
                    <ExpansionPanel key={column.column_id} elevation={2}>
                        <ExpansionPanelSummary
                                expandIcon={ <Icon>expand_more</Icon> }
                            >
                            { columnPropControl( {
                                i,
                                key: 'column_order',
                                label: 'Order',
                                style: { width: 30, marginRight: 10 },
                                inputProps: {
                                    min: 1,
                                    max: view.columns.length,
                                },
                                type: 'number',
                                afterChangeUpdater: ( draft, { oldValue, newValue } ) => {
                                    draft.columns[ newValue - 1 ].column_order = oldValue;
                                    this.reSortColumns( draft.columns );
                                },
                            } ) }
                            { columnPropControl( {
                                i,
                                variant: 'Body1',
                                key: 'name',
                                label: 'Column Title',
                                onClick: e => e.stopPropagation(),
                            } ) }
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails style={{ display: 'block' }}>
                            { columnPropControl( {
                                i,
                                key: 'rt_query',
                                label: 'RT Query',
                                fullWidth: true,
                                multiline: true,
                                InputProps: { style: { fontFamily: 'monospace' } },
                            } ) }
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                ) }
            </CardContent>
        </Card>;
    }
}

@connect(
    ( { user: { views = [] }, inProgress } ) => ( {
        inProgress: inProgress.SAVE_SETTINGS,
        viewIDs: views.map( view => view.view_id ),
    } )
)
export default class SettingsDialog extends React.PureComponent {
    pendingViewUpdates = {};

    addPendingViewUpdate = ( view ) => {
        this.pendingViewUpdates[ view.view_id ] = view;
    };

    componentWillReceiveProps( { open } ) {
        if ( ( open && !this.props.open ) ) {
            this.pendingViewUpdates = {};
        }
    }

    onClickSave = () => this.props.dispatch(
        actions.saveViews( { views: Object.values( this.pendingViewUpdates ) } )
    );

    render() {
        const {
            open,
            onClose,
            viewIDs,
        } = this.props;

        return <TabbedDialog
                open={open}
                onClose={ () => {
                    if (
                        _.isEmpty( this.pendingViewUpdates ) ||
                        confirm( 'You have unsaved changes. Really close?' )
                    ) {
                        onClose();
                    }
                } }
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
                <div
                    style={{
                        height: '100%',
                        paddingLeft: 4,
                        paddingTop: 16,
                        paddingRight: 4,
                        paddingBottom: 16,
                        position: 'relative',
                        overflowY: 'auto',
                    }}
                >
                    { viewIDs.map( viewID =>
                        <ViewSettings
                            dialogOpen={open}
                            key={viewID}
                            viewID={viewID}
                            onViewUpdate={this.addPendingViewUpdate}
                        />
                    ) }
                </div>
                <Typography>OTHER</Typography>
            </TabbedDialogContent>
        </TabbedDialog>;
    }
}
