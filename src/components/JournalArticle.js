// Single section within the day’s journal entry. Renders/facilitates 
// the information/functionality common to all article types: title, 
// icons to toggle edit mode and to delete. 
// Depending on the type of the article, will render the appropriate
// *ArticleContent defined below.

import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class JournalArticle extends Component {
  render() {
    return (
      <div>
        {this.props.value.kind}
        {this.props.value.title}
      </div>
    )
  }
}

JournalArticle.propTypes = {
  value: PropTypes.object.isRequired
}