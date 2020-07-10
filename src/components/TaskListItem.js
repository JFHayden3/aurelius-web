// Renders a single task in human-readable format and a delete icon. 
// When hovered, is shown as obviously clickable. 
// When clicked, switches to task-editor view to allow editing

import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class TaskListItem extends Component {
  render() {
  //  activity: {
  //    kind: "GROWTH",
  //    content: "#growth-activity1"
  //  },
  //  optDuration: {},
  //  optTime: {},
  //  optNotes: "Some special notes about growth activity 1"
    const {activity, optDuration, optTime, optNotes } = this.props.value
    return (
      <div>{activity.content} :  {optNotes}</div>
    )
  }
}

TaskListItem.propTypes = {
  value: PropTypes.object.isRequired
}