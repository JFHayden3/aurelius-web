// Single section within the day’s journal entry. Renders/facilitates 
// the information/functionality common to all article types: title, 
// icons to toggle edit mode and to delete. 
// Depending on the type of the article, will render the appropriate
// *ArticleContent defined below.

import React, { Component } from 'react'
import { IntentionsArticleContent } from './IntentionsArticleContent'
import AgendaArticleContent from './AgendaArticleContent'
import { ReflectionsArticleContent } from './ReflectionsArticleContent'
import { selectArticleById } from '../model/journalArticlesSlice'
import { useSelector } from 'react-redux'
import { Card } from 'antd'
import { DeleteOutlined } from '@ant-design/icons';

export const JournalArticle = ({ articleId }) => {
  const article = useSelector((state) => selectArticleById(state, articleId))
  if (article) {
    const { title, kind, content } = article
    return (
      <Card title={title}
        type="inner"
        actions={[
          <DeleteOutlined key="delete" />
        ]}>
        <div>
          {kind === 'REFLECTION' && <ReflectionsArticleContent articleId={articleId} />}
          {kind === 'INTENTION' && <IntentionsArticleContent articleId={articleId} />}
          {kind === 'AGENDA' && <AgendaArticleContent value={content} />}
        </div>
      </Card>)
  } else {
    return (<div></div>)
  }
}