import React from 'react';
import { createMuiTheme, MuiThemeProvider, CssBaseline } from '@material-ui/core';

import IngredientGraph from 'components/IngredientGraph';

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
      <IngredientGraph />
    </MuiThemeProvider>
  );
};

export default App;
