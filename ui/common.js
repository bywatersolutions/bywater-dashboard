import { createMuiTheme } from 'material-ui/styles';
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
    fullPage: { flexGrow: 1, height: "100vh" },
    textField: { minWidth: 200 },
} );
