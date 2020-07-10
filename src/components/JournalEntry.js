// Contains/arranges all the journal articles for a given day.
// Has a child button with popup for adding new journal articles to the day.

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import JournalArticle from './JournalArticle'

export default class JournalEntry extends Component {
  render() {
    return (
      <div>
        <div>
          {this.props.value.date.toLocaleDateString()}
        </div>
        <ul>
          {this.props.value.articles.map((article) => (
            <li key={article.id}>
              <JournalArticle value={article} />
            </li>
          ))}
        </ul>
      </div>
    )
  }
}

JournalEntry.propTypes = {
  value: PropTypes.object.isRequired
}