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
        {
          id: 3,
          kind: 'AGENDA',
          title: 'Today\'s Plan',
          content: {
            vow: "In order to step closer to my potential I vow to do the following today",
            items: [
              {
                id: 1,
                activity: {
                  kind: "GROWTH",
                  content: "#growth-activity1"
                },
                optDuration: {},
                optTime: {},
                optNotes: "Some special notes about growth activity 1"
              },
              {
                id: 2,
                activity: {
                  kind: "CUSTOM",
                  content: "Pick up the mail"
                },
                optDuration: {},
                optTime: {},
                optNotes: "details about picking up mail"
              },
            ] 
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