// Simple container for all the daily journal entries.
// May also add children for searching and filtering later. 
// For now, just responsible for facilitating the infinite scroll behavior

import JournalEntry from './JournalEntry'
import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class LifeJournal extends Component {
  render() {
    return (
      <ul>
        {this.props.entries.map((entry) => (
          <li key={entry.date}>
            <JournalEntry value={entry} />
          </li>
        ))}
      </ul>
    )
  }
}

LifeJournal.propTypes = {
  entries: PropTypes.array.isRequired
}