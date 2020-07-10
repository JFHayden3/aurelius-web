import React, { Component } from 'react'
import { Provider } from 'react-redux'
import configureStore from '../configureStore'
import JournalApp from './JournalApp'

const dummyState = {
  entries: [
    {
      date: new Date(Date.now()),
      articles: [
        {
          id: 1,
          kind: 'REFLECTION',
          title: 'Recent Reflections',
          content: {
            hint: "How have things been going?",
            text: "Blah, blah, dildoes"
          }
        },
        {
          id: 2,
          kind: 'INTENTION',
          title: 'Day\'s Intentions',
          content: {
            hint: "What would you like to make out of this day?",
            text: "Blah, blah, want to do important stuff"
          }
        },
      ]
    },
    {
      date: new Date(Date.parse("2020-10-30")),
      articles: []
    },
    {
      date: new Date(Date.parse("2020-10-28")),
      articles: []
    }
  ]
}

const store = configureStore(dummyState)

export default class Root extends Component {
  render() {
    return (
      <Provider store={store}>
        <JournalApp />
      </Provider>
    )
  }
}