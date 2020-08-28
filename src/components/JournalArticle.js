// Single section within the day’s journal entry. Renders/facilitates 
// the information/functionality common to all article types: title, 
// icons to toggle edit mode and to delete. 
// Depending on the type of the article, will render the appropriate
// *ArticleContent defined below.

import React from 'react'
import { selectArticleKindById, selectArticleTitleById, removeArticle } from '../model/journalArticlesSlice'
import { useSelector, useDispatch } from 'react-redux'
import { Button, Divider } from 'antd'
import { DeleteOutlined } from '@ant-design/icons';
import { AgendaArticleContent } from './AgendaArticleContent'
import { WrittenArticleContent } from './WrittenArticleContent'
import { ViceLogArticleContent } from './ViceLogArticleContent'

export const JournalArticle = ({ articleId }) => {
  const title = useSelector((state) => selectArticleTitleById(state, articleId))
  const kind = useSelector((state) => selectArticleKindById(state, articleId))
  const dispatch = useDispatch()
  const getArticleContent = kind => {
    switch (kind) {
      case 'AGENDA':
        return (<AgendaArticleContent articleId={articleId} />)
      case 'VICE_LOG':
        return (<ViceLogArticleContent articleId={articleId} />)
      default:
        return (<WrittenArticleContent articleId={articleId} />)
    }
  }
  if (kind) {
    return (
      <div>
        <Divider orientation="left">
          <span>
            {title}
            <Button onClick={(e) => dispatch(removeArticle({ articleId }))} type="text" shape="round" icon={<DeleteOutlined />} />
          </span>
        </Divider>
        {getArticleContent(kind)}
      </div>
    )
  } else {
    return (<div></div>)
  }
}