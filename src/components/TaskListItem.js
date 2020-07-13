// Renders a single task in human-readable format and a delete icon. 
// When hovered, is shown as obviously clickable. 
// When clicked, switches to task-editor view to allow editing

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Card } from 'antd';
import TaskEditor from './TaskEditor'

export default class TaskListItem extends Component {
  constructor(props) {
    super(props)
    this.state = {
      editing: false
    }
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(e) {
    if (!this.state.editing) {
      e.preventDefault()
      this.setState({editing: true})
    }
  }

  render() {
    const { activity, optDuration, optTime, optNotes } = this.props.value
    if (this.state.editing) {
      return (
        <TaskEditor value={this.props.value} />
      )
    } else {
      return (
        <Card size="small" bordered={false} hoverable={true} onClick={this.handleClick}>
          {activity.content} :  {optNotes}
        </Card>
      )
    }
  }
}

TaskListItem.propTypes = {
  value: PropTypes.object.isRequired
}