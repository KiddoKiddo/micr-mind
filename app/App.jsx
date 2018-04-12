import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import Home from './components/home/Home';
import Docs from './components/docs/Docs';
import Mind from './components/mind/Mind';
import Story from './components/story/Story';
import menu from './menu';

const App = () => (
  <Switch>
    <Route exact path="/" component={Home} />
    <Route path="/docs=" component={Docs} />
    <Route path="/mind" component={Mind} />
    <Route path="/story" component={Story} />
  </Switch>
);

export default App;
