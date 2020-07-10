// text area with relevant hint text. Provides a typeahead 
// dropdown and automatic highlighting/linking for references to
// vices/growths

import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class IntentionsArticleContent extends Component {
  render() {
    const {hint, text} = this.props.value
    return (
      <textarea placeholder={hint} defaultValue={text} />
    )
  }
}

IntentionsArticleContent.propTypes = {
  value: PropTypes.object.isRequired
}