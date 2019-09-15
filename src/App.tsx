import React from 'react';
import { createMuiTheme, MuiThemeProvider, CssBaseline } from '@material-ui/core';

import 'typeface-roboto';

import Main from 'components/Main';

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
      <Main />
    </MuiThemeProvider>
  );
};

export default App;
