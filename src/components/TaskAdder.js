
// Renders a single task in human-readable format and a delete icon. 
// When hovered, is shown as obviously clickable. 
// When clicked, switches to task-editor view to allow editing

import React, { Component } from 'react'

export default class TaskAdder extends Component {
  render() {
    return (
      <button>+</button>
    )
  }
}