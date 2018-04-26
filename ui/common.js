// Miscellaneous utilities and definitions.

import { CircularProgress } from 'material-ui';
import { createMuiTheme, withStyles } from 'material-ui/styles';
import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { blue } from 'material-ui/colors';

// Customizations to MUI's built-in palette.
export const theme = createMuiTheme( {
    palette: {
        primary: blue,
    },
} );

// CSS "classes" for our own widgets.
// eslint-disable-next-line no-shadow
export const styles = theme => ( {
    placeholder: { opacity: .3 },

    centeredLoadMore: {
        ...theme.typography.caption,
        marginLeft: 'auto',
        marginRight: 'auto',
        // Terrible hack. Compensates for automatic styling of ExpansionPanelSummary last-child.
        paddingLeft: 32,
    },

    dragOver: { backgroundColor: theme.palette.action.hover },

    errorSnackbarRoot: {
        backgroundColor: theme.palette.error.main,
    },

    fab: {
        position: 'fixed',
        right: theme.spacing.unit * 1,
        bottom: theme.spacing.unit * 2,
    },

    fixedDialogPaper: {
        height: '90vh',
        maxHeight: null,
        overflow: 'hidden',
        width: theme.breakpoints.values.md,
    },

    flex: { flex: 1 },

    fullPage: { flexGrow: 1, height: '100vh' },

    iconAdornment: {
        marginRight: theme.spacing.unit * 1,
        verticalAlign: 'bottom',
        '&:last-child': {
            marginRight: 0,
        },
    },

    page: {
        overflowY: 'auto',
        padding: theme.spacing.unit * 3,
    },

    textField: { minWidth: 200 },
    textFieldTitle: theme.typography.title,
    textFieldBody1: theme.typography.body1,

    topTabs: { color: 'white', flex: 1, marginLeft: theme.spacing.unit * 3 },
} );

// Two convenient decorators; the first passes the "classes" prop to the decorated component, and
// the second does that and connects the component to Redux.
export const withOurStyles = withStyles( styles );

export function connectWithStyles( ...rest ) {
    return compose( withStyles( styles ), connect( ...rest ) );
}

// FIXME: move to '/actions/common' ?
export function lookupColumn( columns, columnID ) {
    return Object.values( columns ).find( ( { column_id } ) => column_id == columnID );
}

// Credit to https://gist.github.com/KilianSSL/774297b76378566588f02538631c3137
export function scrollIntoViewIfNeeded( element, centerIfNeeded ) {
    centerIfNeeded = arguments.length === 1 ? true : !!centerIfNeeded;

    let parent = element.parentNode,
        parentComputedStyle = window.getComputedStyle( parent, null );

    let parentBorderLeftWidth = parseInt( parentComputedStyle.getPropertyValue( 'border-left-width' ) ),
        parentBorderTopWidth = parseInt( parentComputedStyle.getPropertyValue( 'border-top-width' ) );

    let overBottom = (
            element.offsetTop - parent.offsetTop + element.clientHeight - parentBorderTopWidth
        ) > ( parent.scrollTop + parent.clientHeight ),
        overLeft = element.offsetLeft - parent.offsetLeft < parent.scrollLeft,
        overRight = (
            element.offsetLeft - parent.offsetLeft + element.clientWidth - parentBorderLeftWidth
        ) > ( parent.scrollLeft + parent.clientWidth ),
        overTop = element.offsetTop - parent.offsetTop < parent.scrollTop;

    let alignWithTop = overTop && !overBottom;

    if ( ( overTop || overBottom ) && centerIfNeeded ) {
        parent.scrollTop =
            element.offsetTop - parent.offsetTop -
            parent.clientHeight / 2 - parentBorderTopWidth +
            element.clientHeight / 2;
    }

    if ( ( overLeft || overRight ) && centerIfNeeded ) {
        parent.scrollLeft =
            element.offsetLeft - parent.offsetLeft -
            parent.clientWidth / 2 - parentBorderLeftWidth +
            element.clientWidth / 2;
    }

    if ( ( overTop || overBottom || overLeft || overRight ) && !centerIfNeeded ) {
        element.scrollIntoView( {
            block: alignWithTop ? 'start' : 'end',
            inline: 'nearest',
            behavior: 'smooth',
        } );
    }
}

export function LoadingOverlay() {
    return <div
        style={{
            backgroundColor: 'rgba( 255, 255, 255, .7 )',

            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            zIndex: 1250,

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}
    >
        <CircularProgress />
    </div>;
}
