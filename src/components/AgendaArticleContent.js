// Displays the 'agenda vow' and renders the task list. 

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TaskList from './TaskList'

export default class AgendaArticleContent extends Component {
  render() {
    const { vow, items } = this.props.value
    return (
      <div>
        <div style={{
          background: '#f6f6f6',
          fontStyle:'italic',
          padding:'5px',
          borderColor: 'lightgray',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderRadius: '1px',
          marginBottom: '16px'
        }}>
          {vow}
        </div>
        <TaskList value={items} />
      </div>
    )
  }
}

AgendaArticleContent.propTypes = {
  value: PropTypes.object.isRequired
}