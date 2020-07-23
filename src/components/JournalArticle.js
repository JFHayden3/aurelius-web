// Single section within the day’s journal entry. Renders/facilitates 
// the information/functionality common to all article types: title, 
// icons to toggle edit mode and to delete. 
// Depending on the type of the article, will render the appropriate
// *ArticleContent defined below.

import React, { Component } from 'react'
import AgendaArticleContent from './AgendaArticleContent'
import { selectArticleById, removeArticle } from '../model/journalArticlesSlice'
import { useSelector, useDispatch } from 'react-redux'
import { Button, Divider } from 'antd'
import { DeleteOutlined } from '@ant-design/icons';
import { WrittenArticleContent } from './WrittenArticleContent'


export const JournalArticle = ({ articleId }) => {
  const article = useSelector((state) => selectArticleById(state, articleId))
  const dispatch = useDispatch()
  if (article) {
    const { title, kind, content } = article
    return (
      <div>
        <Divider orientation="left">
          <span>
            {title}
            <Button onClick={(e)=>dispatch(removeArticle({ articleId }))} type="text" shape="round" icon={<DeleteOutlined />} />
          </span>
        </Divider>
        <div>
          {['REFLECTION', 'INTENTION', 'GRATITUDE', 'DREAMS'].includes(kind)
            && <WrittenArticleContent articleId={articleId} />}
          {kind === 'AGENDA' && <AgendaArticleContent value={content} />}
        </div>
      </div>
    )
  } else {
    return (<div></div>)
  }
}