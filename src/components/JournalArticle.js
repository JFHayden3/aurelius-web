// Single section within the day’s journal entry. Renders/facilitates 
// the information/functionality common to all article types: title, 
// icons to toggle edit mode and to delete. 
// Depending on the type of the article, will render the appropriate
// *ArticleContent defined below.

import React from 'react'
import { selectArticleKindById, selectArticleTitleById, removeArticle } from '../model/journalArticlesSlice'
import { useSelector, useDispatch } from 'react-redux'
import { Button, Divider, Dropdown, Menu } from 'antd'
import { DeleteOutlined, MoreOutlined } from '@ant-design/icons';
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
    const menu = (
      <Menu>
        <Menu.Item key="delete" onClick={(e) => dispatch(removeArticle({ articleId }))}><DeleteOutlined/>Delete</Menu.Item>
      </Menu>
    )
    return (
      <div>
        <Divider orientation="left">
          <span>
            {title}
            <Dropdown overlay={menu} trigger={['click']}>
              <Button type="text" shape="round" icon={<MoreOutlined />} />
            </Dropdown>
          </span>
        </Divider>
        {getArticleContent(kind)}
      </div>
    )
  } else {
    return (<div></div>)
  }
}