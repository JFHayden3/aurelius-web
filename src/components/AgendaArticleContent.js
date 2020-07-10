// Displays the 'agenda vow' and renders the task list. 

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TaskList from './TaskList'

export default class AgendaArticleContent extends Component {
  render() {
    const { vow, items } = this.props.value
    return (
      <div>
        <div>{vow}</div>
        <TaskList value={items} />
      </div>
    )
  }
}

AgendaArticleContent.propTypes = {
  value: PropTypes.object.isRequired
}