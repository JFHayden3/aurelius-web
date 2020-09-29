// Displays the 'agenda vow' and renders the task list. 

import React from 'react'
import { TaskList } from './TaskList'
import { RestrictionList } from './RestrictionList'
import { useSelector, useDispatch } from 'react-redux'
import { selectArticleContentById, textUpdated } from '../model/journalArticlesSlice'
import { TaggableTextField } from './TaggableTextField'
import { Input, Divider } from 'antd';

export const AgendaArticleContent = ({ articleId }) => {
  const content = useSelector((state) => selectArticleContentById(state, articleId))
  const dispatch = useDispatch()
  return (
    <div>
      <TaggableTextField placeholder="High-level notes about today's agenda..."
        value={content.text}
        onChange={(val) =>
          dispatch(textUpdated({ articleId: articleId, text: val }))}
      />
      <Divider plain orientation="left">Agenda</Divider>
      <TaskList articleId={articleId} />
      <Divider plain orientation="left">Restrictions</Divider>
      <RestrictionList articleId={articleId} />
    </div>
  )
}
