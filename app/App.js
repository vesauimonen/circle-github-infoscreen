import React from 'react';
import ReactDOM from 'react-dom';
import {hashHistory, Router} from 'react-router';

import routes from './config/routes';


require('./app.less');

ReactDOM.render(
  <Router history={hashHistory}>{routes}</Router>,
  document.getElementById('app')
);
