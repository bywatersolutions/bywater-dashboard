import { createMuiTheme, withStyles } from 'material-ui/styles';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { blue } from 'material-ui/colors';

export const theme = createMuiTheme({
    palette: {
        primary: blue,
    },
    status: {
        danger: 'orange',
    },
});

export const styles = theme => ( {
    flex: { flex: 1 },
    fullPage: { flexGrow: 1, height: '100vh' },
    textField: { minWidth: 200 },
    iconAdornment: { paddingRight: theme.spacing.unit * 1, verticalAlign: 'bottom' },
} );

export function connectWithStyles( ...rest ) {
    return compose( withStyles( styles ), connect( ...rest ) );
}
