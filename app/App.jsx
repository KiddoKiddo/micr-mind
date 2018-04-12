import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
// import Home from './components/home/Home';
// import Docs from './components/docs/Docs';
import Mind from './components/mind/Mind';
import Story from './components/story/Story';
import menu from './menu';

// TODO: To change in "home" and "docs" to fix to the new router
const App = () => (
  <Switch>
    {/*
    <Route exact path="/" component={Home} />
    <Route path="/docs=" component={Docs} />
    */}
    <Route path="/" component={Story} />
    <Route path="/mind" component={Mind} />
  </Switch>
);

export default App;
