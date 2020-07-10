// Renders all the individual task items as TaskListItems and 
// contains a button for adding more tasks. 
// (NOTE: I’m also considering adding a timeline-like view for more 
// elegant display of the day’s activities)

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TaskListItem from './TaskListItem'
import TaskAdder from './TaskAdder'

export default class TaskList extends Component {
  render() {
    const items = this.props.value
    return (
      <div>
        <ul>
          {items && items.map((task) => (
            <li key={task.id}>
              <TaskListItem value={task} />
            </li>
          ))}
        </ul>
        <TaskAdder />
      </div>
    )
  }
}

TaskList.propTypes = {
  value: PropTypes.arrayOf(Object).isRequired
}