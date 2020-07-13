// Simple container for all the daily journal entries.
// May also add children for searching and filtering later. 
// For now, just responsible for facilitating the infinite scroll behavior

import JournalEntry from './JournalEntry'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { List, Card } from 'antd';


export default class LifeJournal extends Component {
  render() {
    return (
      <List
        itemLayout="vertical"
        dataSource={this.props.entries}
        renderItem={entry =>
          <List.Item key={entry.date}>
            <Card title={entry.date.toLocaleDateString()}>
              <JournalEntry value={entry} />
            </Card>
          </List.Item>
        }
      >
      </List>
    )
  }
}

LifeJournal.propTypes = {
  entries: PropTypes.array.isRequired
}