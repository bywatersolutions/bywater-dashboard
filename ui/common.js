"use strict";

// Miscellaneous utilities and definitions.

import { createMuiTheme, withStyles } from 'material-ui/styles';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { blue, white } from 'material-ui/colors';

// Customizations to MUI's built-in palette.
export const theme = createMuiTheme({
    palette: {
        primary: blue,
    },
});

// CSS "classes" for our own widgets.
export const styles = theme => ( {
    placeholder: { opacity: .3 },
    dragOver: { backgroundColor: theme.palette.action.hover },
    fixedDialogPaper: { 
        height: '90vh',
        maxHeight: null,
        width: theme.breakpoints.values.md,
    },
    flex: { flex: 1 },
    fullPage: { flexGrow: 1, height: '100vh' },
    iconAdornment: { paddingRight: theme.spacing.unit * 1, verticalAlign: 'bottom' },
    page: { padding: theme.spacing.unit * 3 },
    textField: { minWidth: 200 },
    topTabs: { color: 'white', flex: 1, marginLeft: theme.spacing.unit * 3 },
} );

// Two convenient decorators; the first passes the "classes" prop to the decorated component, and
// the second does that and connects the component to Redux.
export const withOurStyles = withStyles( styles );

export function connectWithStyles( ...rest ) {
    return compose( withStyles( styles ), connect( ...rest ) );
}
