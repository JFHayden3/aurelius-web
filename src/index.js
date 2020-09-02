import 'babel-polyfill'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Root } from './containers/Root'
import store from './configureStore'

render(
  <Provider store={store}>
    <Router>
      <Root />
    </Router>
  </Provider>, document.getElementById('root'))