import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// plugins
require('./plugins/highlight/atom-one-dark.css');
// styles
require('./styles.css');

render((
  <BrowserRouter>
    <App />
  </BrowserRouter>
), document.getElementById('root'));
