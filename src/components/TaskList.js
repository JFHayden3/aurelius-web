// Renders all the individual task items as TaskListItems and 
// contains a button for adding more tasks. 
// (NOTE: I’m also considering adding a timeline-like view for more 
// elegant display of the day’s activities)

import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectArticleById, updateAgendaTask, selectTaskById, moveAgendaTask, addAgendaTask } from '../model/journalArticlesSlice'
import moment from 'moment';
import { Timeline, Button, Space, Typography } from 'antd';
import { AgendaTaskModal } from './AgendaTaskModal'
import { MenuOutlined, PlusOutlined } from '@ant-design/icons';
import { useDrop } from 'react-dnd'
import { useDrag } from 'react-dnd'

const { Text, Paragraph } = Typography

const ReadonlyTaskListItem = ({ articleId, taskId, onEditClick }) => {
  const task = useSelector((state) => selectTaskById(state, articleId, taskId))
  const [{ isDragging }, drag] = useDrag({
    item: { type: 'task', task: task },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  })
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
    <div ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}>
      <Space direction='horizontal' size='small' align='start'>
        <MenuOutlined style={{ cursor: 'grab' }} />
        <Button onClick={e => onEditClick()} type="text" block style={{ height: '100%', padding: '0' }}>
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
                <Text ellipsis={{ rows: 2, expandable: true, symbol: 'more' }} type='secondary' style={{ fontStyle: 'italic' }}>
                  {optNotes}
                </Text>
              }
            </Space>
          </Space>
        </Button>
      </Space>
    </div>
  )
}

const TaskSpace = ({ index, moveTask, children }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'task',
    drop: (item) => moveTask(item.task, index),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  })
  return (
    <div ref={drop}
      style={{
        borderTopWidth: "2px",
        borderTopStyle: isOver ? 'solid' : 'none',
      }}>
      {children}
    </div>
  )
}

export const TaskList = ({ articleId }) => {
  const article = useSelector((state) => selectArticleById(state, articleId))
  const dispatch = useDispatch()
  const [modalVisible, setModalVisible] = useState(false)
  const [modalTask, setModalTask] = useState(null)
  const tasks = article.content.tasks || []

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
  const onAddTaskClick = e => {
    dispatch(addAgendaTask({ articleId, addIndex:tasks.length }))
    // TODO make this not shit
  }
  function moveTask(task, index) {
    dispatch(moveAgendaTask({ articleId, taskIdToMove: task.id, toIndex: index }))
  }
  return (
    <div>
      <Timeline>
        {tasks && tasks.map((task, index) => (
          <Timeline.Item key={task.id} style={{ paddingBottom: '0px' }}>
            <TaskSpace index={index} moveTask={moveTask}>
              <ReadonlyTaskListItem articleId={articleId} taskId={task.id} onEditClick={onEditTaskClick(task)} />
            </TaskSpace>
          </Timeline.Item>
        ))}
        <Timeline.Item key={tasks.length}>
          <TaskSpace index={tasks.length} moveTask={moveTask}>
            <Button block onClick={onAddTaskClick}>
              <PlusOutlined /> Add Task
            </Button>
          </TaskSpace>
        </Timeline.Item>

      </Timeline>
      {
        modalTask &&
        <AgendaTaskModal
          agendaTask={modalTask}
          isVisible={modalVisible}
          onConfirm={onModalOk}
          onCancel={onModalCancel} />
      }
    </div>
  )
}