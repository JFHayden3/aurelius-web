
// Renders a single task in human-readable format and a delete icon. 
// When hovered, is shown as obviously clickable. 
// When clicked, switches to task-editor view to allow editing

import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { PlusCircleOutlined } from '@ant-design/icons';

import { addAgendaTask } from '../model/journalArticlesSlice'
import { Button } from 'antd'

export const TaskAdder = ({ articleId, addIndex }) => {
  const dispatch = useDispatch()
  return (
    <Button icon={<PlusCircleOutlined/>} onClick={(e) => dispatch(addAgendaTask({ articleId, addIndex }))} ></Button>
  )
}