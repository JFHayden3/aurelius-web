// Renders all the individual task items as TaskListItems and 
// contains a button for adding more tasks. 
// (NOTE: I’m also considering adding a timeline-like view for more 
// elegant display of the day’s activities)

import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectArticleById, updateAgendaTask, selectTaskById, moveAgendaTask, addAgendaTask, removeAgendaTask } from '../model/journalArticlesSlice'
import moment from 'moment';
import { Timeline, Button, Space, Typography, Tooltip } from 'antd';
import { AgendaTaskModal } from './AgendaTaskModal'
import { MenuOutlined, PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { useDrop, useDrag } from 'react-dnd'

const { Text } = Typography

const ReadonlyTaskListItem = ({ articleId, taskId, onEditClick }) => {
  const [hovered, setHovered] = useState(false)
  const task = useSelector((state) => selectTaskById(state, articleId, taskId))
  const dispatch = useDispatch()
  const [{ isDragging }, drag] = useDrag({
    item: { type: 'task', task: task },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  })
  const onDeleteClick = e => {
    dispatch(removeAgendaTask({ articleId, removeId: taskId }))
  }
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
        <MenuOutlined style={{ cursor: 'grab', paddingTop:'6px' }} />
        <div
          onMouseEnter={e => setHovered(true)}
          onMouseLeave={e => setHovered(false)}>
          <Space direction='horizontal' align='start'>
            <div onClick={e => onEditClick()}
              style={{
                cursor: 'pointer',
                height: '100%',
                padding: '2px',
                borderRadius: '6px',
                boxShadow: hovered ? '2px 2px 3px gray' : 'unset'
              }}>
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
            </div>
            <Tooltip title="Remove task">
              <div onClick={onDeleteClick} style={{ cursor: 'pointer', visibility: hovered ? 'visible' : 'hidden' }}><CloseOutlined /></div>
            </Tooltip>
          </Space>
        </div>
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
    // We canceled out of the modal on a new task (because that's the only time the activity 
    // content could be empty). Hacky approach, but w/e it's fine
    if ((modalTask.activity.content ?? "") === "") {
      dispatch(removeAgendaTask({ articleId, removeId: modalTask.id }))
    }
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
    const newId = tasks.length > 0 ?
      Math.max.apply(null, tasks.map(task => task.id)) + 1
      : 0
    const newTask = {
      id: newId,
      activity: { content: "", kind: "CUSTOM" }
    }
    dispatch(addAgendaTask({ articleId, addIndex: tasks.length, newTask }))
    setModalTask(newTask)
    setModalVisible(true)
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
            <Button onClick={onAddTaskClick} type="dashed" style={{ margin: '5px' }}>
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