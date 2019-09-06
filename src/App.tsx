import React from 'react';
import { createMuiTheme, MuiThemeProvider, CssBaseline } from '@material-ui/core';

import './App.css';

const theme = createMuiTheme( {
  palette: {
    type: 'dark',
  },
} );

const App: React.FC = () =>
{
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <div>
        {JSON.stringify( process.env.DISPLAY_NAME, null, 2 )}
      </div>
    </MuiThemeProvider>
  );
};

export default App;
