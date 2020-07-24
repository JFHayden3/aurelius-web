// Renders all the individual task items as TaskListItems and 
// contains a button for adding more tasks. 
// (NOTE: I’m also considering adding a timeline-like view for more 
// elegant display of the day’s activities)

import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectArticleById } from '../model/journalArticlesSlice'
import { TaskListItem } from './TaskListItem'
import { TaskAdder } from './TaskAdder'
import { Timeline } from 'antd';

export const TaskList = ({ articleId }) => {
  const article = useSelector((state) => selectArticleById(state, articleId))
  const dispatch = useDispatch()
  const tasks = article.content.tasks || []
  return (
    <div>
      <Timeline>
        {tasks && tasks.map((task, index) => (
          <Timeline.Item key={task.id}>
            <TaskAdder articleId={articleId} addIndex={index} />
            <TaskListItem articleId={articleId} taskId={task.id} />
          </Timeline.Item>
        ))}

      </Timeline>
      <TaskAdder articleId={articleId} addIndex={tasks.length} />
    </div>

  )
}