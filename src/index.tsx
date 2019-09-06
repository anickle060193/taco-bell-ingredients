import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

ReactDOM.render(
  <App />,
  document.getElementById( 'root' )
);

if( process.env.NODE_ENV === 'development' )
{
  if( module.hot )
  {
    module.hot.accept( './App', () =>
    {
      console.log( '---------- %cAPP HOT RELOAD%c ----------', 'color: lightblue; font-weight: bold;', '' );

      ReactDOM.render(
        <App />,
        document.getElementById( 'root' )
      );
    } );
  }
}
