import React from 'react';
import { createMuiTheme, MuiThemeProvider, CssBaseline } from '@material-ui/core';

import RecipeGraph from 'components/RecipeGraph';

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
      <RecipeGraph />
    </MuiThemeProvider>
  );
};

export default App;
