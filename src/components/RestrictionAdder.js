
import React from 'react'
import { useDispatch } from 'react-redux'
import { PlusCircleOutlined } from '@ant-design/icons';

import { addAgendaRestriction } from '../model/journalArticlesSlice'
import { Button } from 'antd'

export const RestrictionAdder = ({ articleId }) => {
  const dispatch = useDispatch()
  return (
    <Button icon={<PlusCircleOutlined/>} onClick={(e) => dispatch(addAgendaRestriction({ articleId }))} ></Button>
  )
}