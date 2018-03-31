// History view for a single ticket.

import {
    Divider,
    Fade,
    Icon,
    Typography,
} from 'material-ui';

import ExpansionPanel, {
    ExpansionPanelSummary,
    ExpansionPanelDetails,
} from 'material-ui/ExpansionPanel';

import {
    LinearProgress,
} from 'material-ui/Progress';

import moment from 'moment';
import { extractFrom } from 'planer';
import React from 'react';
import { connect } from 'react-redux';

import { connectWithStyles } from '../../common';
import * as actions from '../../control/actions';

function _renderHistoryEntryContent( content ) {
    return { __html: content.replace( /\n/g, '<br />' ) };
}

const trimByRenderer = ( entry, icon ) => [
    icon || 'change_history',
    entry.Description.replace( new RegExp( `by ${entry.Creator}$` ), '' ),
    '',
];

const historyEntryRenderers = {
    AddWatcher: entry => trimByRenderer( entry, 'account_box' ),
    DelWatcher: entry => trimByRenderer( entry, 'account_box' ),
    SetWatcher: entry => trimByRenderer( entry, 'account_box' ),

    Comment: entry => [
        'announcement',
        'Private comment',
        extractFrom( entry.Content, 'text/plain' ),
    ],
    CommentEmailRecord: null,
    Correspond: entry => [
        'comment',
        'Public reply',
        extractFrom( entry.Content, 'text/plain' ),
    ],
    Create: entry => [
        'new_releases',
        'Ticket created',
        entry.Content,
    ],
    CustomField: entry => trimByRenderer( entry, 'label' ),
    EmailRecord: null,
    Set: entry => {
        // `Owner` changes will be handled by AddWatcher
        if ( entry.Field == 'Owner' ) return null;
        // `Queue` changes are better handled by RT itself; we'd have to match the queue IDs
        // ourselves
        if ( entry.Field == 'Queue' ) return trimByRenderer( entry, 'compare_arrows' );

        return [
            entry.Field == 'Subject' ? 'subject' : 'label',
            `${entry.Field} changed to "${entry.NewValue}"`,
            `Old value: "${entry.OldValue}"`,
        ];
    },
    Status: entry => [
        [ 'answered', 'resolved' ].includes( entry.NewValue ) ? 'check_circle' : 'swap_vertical_circle',
        `Status changed to ${entry.NewValue}`,
        `Old status: ${entry.OldValue}`,
    ],
    SystemError: null,
};

@connectWithStyles(
    ( { inProgress }, { kind } ) => ( {
        inProgress: kind == 'new' ?
            inProgress.GET_NEW_HISTORY_ENTRIES :
            inProgress.GET_OLD_HISTORY_ENTRIES,
    } )
)
class LoadMorePanel extends React.Component {
    onClick = () => {
        const { dispatch, kind, ids, ticketID } = this.props;

        dispatch(
            actions[ kind == 'new' ? 'getNewHistoryEntries' : 'getOldHistoryEntries' ]( {
                ticket_id: ticketID,
                history_ids: ids,
            } )
        );
    }

    render() {
        const { classes, inProgress, ids } = this.props;

        return <ExpansionPanel expanded={false} onChange={ inProgress ? () => {} : this.onClick }>
            <ExpansionPanelSummary>
                <div className={ classes.centeredLoadMore }>
                    { inProgress ? 'Loading...' : `Load ${ids.length} more...` }
                </div>
            </ExpansionPanelSummary>
        </ExpansionPanel>;
    }
}

class TicketHistoryEntry extends React.PureComponent {
    render() {
        const { entry } = this.props;

        if ( historyEntryRenderers[ entry.Type ] === null ) return null;

        const result = historyEntryRenderers[ entry.Type ] ?
            historyEntryRenderers[ entry.Type ]( entry ) :
            trimByRenderer( entry );

        if ( result == null ) return null;

        let [ icon, summary, contents ] = result;

        const created = moment.utc( entry.Created );
        created.local();

        return <Fade in={true}>
            <ExpansionPanel elevation={2}>
                <ExpansionPanelSummary expandIcon={ <Icon>expand_more</Icon> }>
                    <Icon color="disabled" style={{ marginLeft: -8, marginRight: 8 }}>
                        { icon }
                    </Icon>
                    <Typography type="body1" style={{
                        alignSelf: 'center',
                        marginRight: 4,
                        flexShrink: 1,
                    }}>
                        { summary }
                    </Typography>
                    <Typography type="body1" style={{
                        alignSelf: 'center',
                        flexGrow: 1,
                        textAlign: 'right',
                    }}>
                        { entry.Creator }
                    </Typography>
                    <Typography type="caption" style={{
                        alignSelf: 'center',
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
        </ExpansionPanel>
        </Fade>;
    }
}

@connect(
    ( { tickets, user }, { ticketID } ) => ( {
        history: tickets[ ticketID ] && tickets[ ticketID ].history,
        popup_config: user.popup_config,
    } )
)
export default class TicketHistoryList extends React.Component {
    renderPartialHistory( history ) {
        const { popup_config: { history: historySettings }, ticketID } = this.props;

        const remaining = history.unloaded.length;

        return <React.Fragment>
            { history.old.map( entry => <TicketHistoryEntry key={entry.id} entry={entry} /> ) }
            { remaining == 0 ? null :
                remaining <= historySettings.load_chunk * 2 ?
                    <LoadMorePanel
                        kind="old"
                        ticketID={ticketID}
                        ids={history.unloaded}
                    /> :
                    <React.Fragment>
                        <LoadMorePanel
                            kind="old"
                            ticketID={ticketID}
                            ids={ history.unloaded.slice( 0, historySettings.load_chunk ) }
                        />
                        <Typography
                                type="caption"
                                align="center"
                                component="div"
                                style={{ marginTop: 8, marginBottom: 8 }}
                            >
                            ⋮
                        </Typography>
                        <LoadMorePanel
                            kind="new"
                            ticketID={ticketID}
                            ids={ history.unloaded.slice( -historySettings.load_chunk ) }
                        />
                    </React.Fragment>
            }
            { history.new.map( entry => <TicketHistoryEntry key={entry.id} entry={entry} /> ) }
        </React.Fragment>;
    }

    render() {
        const { history } = this.props;

        return <div
                style={{
                    height: '100%',
                    paddingLeft: 4,
                    paddingTop: 32,
                    paddingRight: 4,
                    paddingBottom: 4,
                    overflowY: 'auto',
                }}
            >
            { !history && <LinearProgress /> }
            { history && this.renderPartialHistory( history ) }
        </div>;
    }
}
