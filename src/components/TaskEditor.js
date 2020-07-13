// Allows users to configure all possible fields of a task. 
// For now displays as a table with editable widgets for each field.
// This whole interaction will require quite a bit of iteration until 
// I feel like it’s sufficiently fluid.

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Input } from 'antd'

export default class TaskEditor extends Component {
  render() {
    //  activity: {
    //    kind: "GROWTH",
    //    content: "#growth-activity1"
    //  },
    //  optDuration: {},
    //  optTime: {},
    //  optNotes: "Some special notes about growth activity 1"
    const { activity, optDuration, optTime, optNotes } = this.props.value
    return (
      <Input.Group compact>
        <Input placeholder='Select activity or enter text' defaultValue={activity.content} />
        <Input placeholder='Notes/Description' defaultValue={optNotes} />
        <Input placeholder='Duration in minutes or custom value' defaultValue={optDuration} />
        <Input placeholder='Time' defaultValue={optTime} />
      </Input.Group>
    )
  }
}

TaskEditor.propTypes = {
  value: PropTypes.object.isRequired
}