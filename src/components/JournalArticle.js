// Single section within the day’s journal entry. Renders/facilitates 
// the information/functionality common to all article types: title, 
// icons to toggle edit mode and to delete. 
// Depending on the type of the article, will render the appropriate
// *ArticleContent defined below.

import React, { Component } from 'react'
import AgendaArticleContent from './AgendaArticleContent'
import { selectArticleById } from '../model/journalArticlesSlice'
import { useSelector } from 'react-redux'
import { Divider } from 'antd'
import { WrittenArticleContent } from './WrittenArticleContent'

export const JournalArticle = ({ articleId }) => {
  const article = useSelector((state) => selectArticleById(state, articleId))
  if (article) {
    const { title, kind, content } = article
    return (
      <div>
        <Divider orientation="left">{title}</Divider>
        <div>
          {kind === 'REFLECTION' && <WrittenArticleContent articleId={articleId} />}
          {kind === 'INTENTION' && <WrittenArticleContent articleId={articleId} />}
          {kind === 'AGENDA' && <AgendaArticleContent value={content} />}
        </div>
      </div>
    )
  } else {
    return (<div></div>)
  }
}