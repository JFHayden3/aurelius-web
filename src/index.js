import 'babel-polyfill'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { AuthRoot } from './containers/Root'
import store from './configureStore'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import Amplify from '@aws-amplify/core';
import aws_exports from './aws-exports';

// in this way you are only importing Auth and configuring it.
Amplify.configure(aws_exports);

render(
  <Provider store={store}>
    <Router>
      <DndProvider backend={HTML5Backend}>
        <AuthRoot />
      </DndProvider>
    </Router>
  </Provider>
  , document.getElementById('root'))