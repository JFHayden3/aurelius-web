// Renders all the individual task items as TaskListItems and 
// contains a button for adding more tasks. 
// (NOTE: I’m also considering adding a timeline-like view for more 
// elegant display of the day’s activities)

import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectArticleById, updateAgendaTask, selectTaskById } from '../model/journalArticlesSlice'
import { TaskAdder } from './TaskAdder'
import moment from 'moment';
import { Timeline, Button, Space, Typography } from 'antd';
import { AgendaTaskModal } from './AgendaTaskModal'
import { EditOutlined } from '@ant-design/icons';
const { Text, Paragraph } = Typography

const ReadonlyTaskListItem = ({ articleId, taskId }) => {
  const dispatch = useDispatch()
  const task = useSelector((state) => selectTaskById(state, articleId, taskId))
  const { activity, optDuration, optTime, optNotes } = task
  var durationStr = null
  if (optDuration) {
    durationStr = "for "
    if (optDuration.hour !== 0) {
      durationStr += optDuration.hour
      durationStr += optDuration.hour > 1 ? " hours" : " hour"
      durationStr += optDuration.minute ? " and " : ""
    }
    if (optDuration.minute !== 0) {
      durationStr += optDuration.minute
      durationStr += optDuration.minute > 1 ? " minutes" : "minute"
    }
  }
  return (
    <Space direction='horizontal' size='middle' align='start'>
      {optTime &&
        <Text>{moment(optTime.hour + ':' + optTime.minute, "h:mm").format("h:mm a")}</Text>
      }
      <Space direction='vertical' size='small' style={{ width: "100%" }}>
        <Space direction='horizontal' style={{ width: "100%" }}>
          <Text>{activity.content}</Text>
          {durationStr &&
            <Text>{durationStr}</Text>
          }
        </Space>
        {optNotes &&
          <Text ellipsis={{ rows: 2, expandable: true, symbol: 'more' }} type='secondary' style={{fontStyle:'italic'}}>
            {optNotes}
          </Text>
        }
      </Space>
    </Space>
  )
}


export const TaskList = ({ articleId }) => {
  const article = useSelector((state) => selectArticleById(state, articleId))
  const dispatch = useDispatch()
  const [modalVisible, setModalVisible] = useState(false)
  const [modalTask, setModalTask] = useState(null)
  const onModalCancel = e => {
    setModalVisible(false)
    setModalTask(null)
  }
  const onModalOk = (taskId, fields) => {
    setModalVisible(false)
    setModalTask(null)
    dispatch(updateAgendaTask({ articleId, taskId, changedFields: fields }))
  }
  const onEditTaskClick =
    task => e => {
      setModalTask(task)
      setModalVisible(true)
    }
  const tasks = article.content.tasks || []
  return (
    <div>
      <Timeline>
        {tasks && tasks.map((task, index) => (
          <Timeline.Item key={task.id}>
            <Space direction='horizontal' size='small'>
              <Button onClick={onEditTaskClick(task)} type="text" block style={{height:'100%', padding:'0'}}>
                <ReadonlyTaskListItem articleId={articleId} taskId={task.id} />
              </Button>
            </Space>
          </Timeline.Item>
        ))}

      </Timeline>
      <TaskAdder articleId={articleId} addIndex={tasks.length} />
      {modalTask &&
        <AgendaTaskModal
          agendaTask={modalTask}
          isVisible={modalVisible}
          onConfirm={onModalOk}
          onCancel={onModalCancel} />}
    </div>

  )
}