// Single section within the day’s journal entry. Renders/facilitates 
// the information/functionality common to all article types: title, 
// icons to toggle edit mode and to delete. 
// Depending on the type of the article, will render the appropriate
// *ArticleContent defined below.

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import IntentionsArticleContent from './IntentionsArticleContent'
import AgendaArticleContent from './AgendaArticleContent'
import ReflectionsArticleContent from './ReflectionsArticleContent'

export default class JournalArticle extends Component {
  render() {
    const { title, kind, content } = this.props.value
    return (
      <div>
        {kind === 'REFLECTION' && <ReflectionsArticleContent value={content} />}
        {kind === 'INTENTION' && <IntentionsArticleContent value={content} />}
        {kind === 'AGENDA' && <AgendaArticleContent value={content} />}
      </div>
    )
  }
}

JournalArticle.propTypes = {
  value: PropTypes.object.isRequired
}