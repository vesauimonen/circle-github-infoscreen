import React from 'react';
import {IndexRoute, Route} from 'react-router';

import Home from '../components/Home';
import Main from '../components/Main';
import Repository from '../components/repository/Repository';


export default (
  <Route path="/" component={Main}>
    <IndexRoute component={Home} />
    <Route path="/:owner/:repository" component={Repository} />
  </Route>
);
