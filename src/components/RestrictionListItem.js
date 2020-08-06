
import React from 'react'
import { Typography, Button, Tooltip, Divider, Select, AutoComplete, Input } from 'antd';
import { ClockCircleOutlined, HourglassOutlined, MessageOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux'
import moment from 'moment';
import { selectRestrictionById, updateAgendaRestriction, removeAgendaRestriction } from '../model/journalArticlesSlice'
import { selectAllVices } from "../model/viceSlice"
const { Text } = Typography;
const { Option } = Select

export const RestrictionListItem = ({ articleId, restrictionId }) => {
  const dispatch = useDispatch()
  const activityRestriction = useSelector((state) => selectRestrictionById(state, articleId, restrictionId))
  const { restriction, activities, optNote } = activityRestriction
  const allVices = useSelector(selectAllVices)
  const onActivitySelectionChange = val => {
    dispatch(updateAgendaRestriction({ articleId, restrictionId, changedFields: { activities: val } }))
  };
  const onNotesTextChange = str => {
    dispatch(updateAgendaRestriction({ articleId, restrictionId, changedFields: { optNote: str } }))
  }
  const onRestrictionChange = str => {
    dispatch(updateAgendaRestriction({ articleId, restrictionId, changedFields: { restriction: str } }))
  }
  const onAddNotesClick = e => {
    e.preventDefault()
    dispatch(updateAgendaRestriction({ articleId, restrictionId, changedFields: { optNote: " " } }))
  }
  const onDeleteClick = e => {
    e.preventDefault()
    dispatch(removeAgendaRestriction({ articleId, removeId: restrictionId }))
  }


  const shape = "default"
  const type = "default"
  return (    
    <div>
      <span>
        <Select
          mode="tags"
          style={{ minWidth: "250px" }}
          onChange={onActivitySelectionChange} defaultValue={activities} >
          {allVices.map(vice =>
            <Option key={vice.refTag}>{vice.name}</Option>
          )}
        </Select>
        <Text editable={{onChange: onRestrictionChange}}>{restriction}</Text>

        {optNote &&
          <Text editable={{ onChange: onNotesTextChange }}>{optNote}</Text>
        }
        <Divider type="vertical" />
        {!optNote &&
          <Tooltip title="Add description">
            <Button shape={shape} type={type} onClick={onAddNotesClick} size="small" icon={<MessageOutlined />} />
          </Tooltip>}

        <Tooltip title="Delete restriction">
          <Button shape={shape} type={type} onClick={onDeleteClick} size="small" icon={<DeleteOutlined />} />
        </Tooltip>
      </span>
    </div>
  )
}
