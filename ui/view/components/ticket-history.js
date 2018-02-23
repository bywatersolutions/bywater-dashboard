"use strict";

// History view for a single ticket.

import {
    AppBar,
    Divider,
    Icon,
    IconButton,
    Tab,
    Tabs,
    Toolbar,
    Typography,
} from 'material-ui';

import ExpansionPanel, {
    ExpansionPanelSummary,
    ExpansionPanelDetails,
} from 'material-ui/ExpansionPanel';

import List, {
    ListItem,
    ListItemText,
    ListSubheader,
} from 'material-ui/List';

import {
    LinearProgress
} from 'material-ui/Progress';

import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';

import * as actions from '../../control/actions';

function _renderHistoryEntryContent( content ) {
    return { __html: content.replace( /\n/g, "<br />" ) };
}

const trimByRenderer = entry => [
    entry.Description.replace( new RegExp( `by ${entry.Creator}$` ), ''),
    '',
];

const historyEntryRenderers = {
    AddLink: trimByRenderer,
    AddReminder: trimByRenderer,
    AddWatcher: trimByRenderer,
    Comment: entry => [
        'Private comment',
        entry.Content
    ],
    CommentEmailRecord: null,
    Correspond: entry => [
        'Public reply',
        entry.Content
    ],
    Create: entry => [
        'Ticket created',
        entry.Content
    ],
    CustomField: null,
    DeleteLink: null,
    DelWatcher: null,
    Disabled: null,
    EmailRecord: null,
    Enabled: null,
    "Forward Ticket": null,
    "Forward Transaction": null,
    OpenReminder: null,
    ResolveReminder: null,
    // `Owner` changes will be handled by AddWatcher
    Set: entry => ( entry.Field == 'Owner' ? null : [
        `${entry.Field} changed to "${entry.NewValue}"`,
        `Old value: "${entry.OldValue}"`
    ] ),
    SetWatcher: null,
    Status: entry => [
        `Status changed to ${entry.NewValue}`,
        `Old status: ${entry.OldValue}`
    ],
    SystemError: null,
    Told: null,
};

@connect(
    ( { tickets }, { ticketID } ) => ( {
        history: tickets[ticketID] && tickets[ticketID].history,
    } )
)
export default class TicketHistoryList extends React.Component {
    render() {
        const { history } = this.props;

        if ( !history ) return <LinearProgress />;

        return <div
                style={{
                    height: '100%',
                    paddingLeft: 4,
                    paddingTop: 32,
                    paddingRight: 4,
                    paddingBottom: 4,
                    overflowY: 'auto'
                }}
            >
            { history.map( ( entry, i ) => {
                const result = historyEntryRenderers[ entry.Type ] ? historyEntryRenderers[ entry.Type ](entry) : null;

                if ( result == null ) return null;
                let [ summary, contents ] = result;

                const created = moment.utc( entry.Created );
                created.local();

                return <ExpansionPanel key={i}>
                    <ExpansionPanelSummary expandIcon={ <Icon>expand_more</Icon> }>
                        <Typography type="subheading" style={{
                                marginRight: 8,
                                flexShrink: 1,
                            }}>
                            { summary }
                        </Typography>
                        <Typography type="caption" style={{
                                alignSelf: "center",
                                flexGrow: 1,
                            }}>
                            { entry.Creator }
                        </Typography>
                        <Typography type="caption" style={{
                                alignSelf: "center",
                                flexShrink: 0,
                                marginLeft: 8,
                            }}
                            title={ created.toString() }>
                            { created.fromNow() }
                        </Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <Divider />
                        <Typography dangerouslySetInnerHTML={ _renderHistoryEntryContent( contents ) } />
                    </ExpansionPanelDetails>
                </ExpansionPanel>;
            } ) }
        </div>;
    }
}
