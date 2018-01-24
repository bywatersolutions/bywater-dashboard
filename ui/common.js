import { createMuiTheme, withStyles } from 'material-ui/styles';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { blue, white } from 'material-ui/colors';

export const theme = createMuiTheme({
    palette: {
        primary: blue,
    },
    status: {
        danger: 'orange',
    },
});

export const styles = theme => ( {
    dragging: { opacity: .5 },
    dragOver: { backgroundColor: theme.palette.action.hover },
    flex: { flex: 1 },
    fullPage: { flexGrow: 1, height: '100vh' },
    iconAdornment: { paddingRight: theme.spacing.unit * 1, verticalAlign: 'bottom' },
    page: { padding: theme.spacing.unit * 3 },
    textField: { minWidth: 200 },
    topTabs: { color: 'white', flex: 1, marginLeft: theme.spacing.unit * 3 },
} );

export const withOurStyles = withStyles( styles );

export function connectWithStyles( ...rest ) {
    return compose( withStyles( styles ), connect( ...rest ) );
}
