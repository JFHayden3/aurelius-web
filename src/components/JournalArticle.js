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
import { ViceLogV2ArticleContent } from './ViceLogV2ArticleContent'

export const JournalArticle = ({ articleId, isReadOnly }) => {
  const title = useSelector((state) => selectArticleTitleById(state, articleId))
  const kind = useSelector((state) => selectArticleKindById(state, articleId))
  const dispatch = useDispatch()
  const getArticleContent = kind => {
    switch (kind) {
      case 'AGENDA':
        return (<AgendaArticleContent articleId={articleId} isReadOnly={isReadOnly} />)
      case 'VICE_LOG_V2':
        return (<ViceLogV2ArticleContent articleId={articleId} isReadOnly={isReadOnly} />)
      default:
        return (<WrittenArticleContent articleId={articleId} isReadOnly={isReadOnly} />)
    }
  }
  if (kind) {
    const menu = (
      <Menu>
        <Menu.Item key="delete" onClick={(e) => dispatch(removeArticle({ articleId }))}><DeleteOutlined />Delete</Menu.Item>
      </Menu>
    )
    return (
      <div>
        <Divider orientation="left">
          <span>
            {title}
            {!isReadOnly &&
              <Dropdown overlay={menu} trigger={['click']}>
                <Button type="text" shape="round" icon={<MoreOutlined />} />
              </Dropdown>
            }
          </span>
        </Divider>
        {getArticleContent(kind)}
      </div>
    )
  } else {
    return (<div></div>)
  }
}