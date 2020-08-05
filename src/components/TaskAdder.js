
// Renders a single task in human-readable format and a delete icon. 
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