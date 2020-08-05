// Displays the 'agenda vow' and renders the task list. 

import React from 'react'
import { TaskList } from './TaskList'
import { RestrictionList } from './RestrictionList'
import { useSelector, useDispatch } from 'react-redux'
import { selectArticleById, textUpdated } from '../model/journalArticlesSlice'
import { Input, Divider } from 'antd';
const { TextArea } = Input

export const AgendaArticleContent = ({ articleId }) => {
  const article = useSelector((state) => selectArticleById(state, articleId))
  const dispatch = useDispatch()
  return (
    <div>
      <TextArea placeholder="High-level notes about today's agenda..."
        defaultValue={article.content.text}
        autoSize
        style={
          {
            overFlowY: "hidden"
            , resize: "none"
            , fontFamily: "helvetica, sans-serif"
            , border: 0
            , marginBottom: '16px'
          }}
        onChange={(e) =>
          dispatch(textUpdated({ articleId: articleId, text: e.target.value }))}
      />
      <Divider plain orientation="left">Agenda</Divider>
      <TaskList articleId={articleId} />
      <Divider plain orientation="left">Anti-Agenda</Divider>
      <RestrictionList articleId={articleId} />
    </div>
  )
}
