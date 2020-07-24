// Renders a single task in human-readable format and a delete icon. 
// When hovered, is shown as obviously clickable. 
// When clicked, switches to task-editor view to allow editing

import React from 'react'
import { Typography, Button, Tooltip, Divider, TimePicker, Select } from 'antd';
import { ClockCircleOutlined, HourglassOutlined, MessageOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux'
import TaskEditor from './TaskEditor'
import moment from 'moment';
import { selectTaskById, updateAgendaTask } from '../model/journalArticlesSlice'
const { Text } = Typography;
const { Option } = Select;

export const TaskListItem = ({ articleId, taskId }) => {
  const dispatch = useDispatch()
  const task = useSelector((state) => selectTaskById(state, articleId, taskId))
  const { activity, optDuration, optTime, optNotes } = task

  const onActivityTextChange = str => {
    dispatch(updateAgendaTask({ articleId, taskId, changedFields: { activity: { content: str } } }))
  };
  const onAddDurationClick = e => {
    e.preventDefault()
    dispatch(updateAgendaTask({ articleId, taskId, changedFields: { optDuration: { hours: 0, minutes: 0 } } }))
  };
  const onDurationChange = (time, timeString) => {

    if (!timeString) {
      dispatch(updateAgendaTask({ articleId, taskId, changedFields: { optDuration: null } }))
    }
  }
  const shape = "default"
  const type = "default"
  return (
    <div>
      <span>
        <Text editable={{ onChange: onActivityTextChange }}>{activity.content}</Text>
        {optDuration &&
          <TimePicker 
            onChange={onDurationChange}
            defaultValue={moment(optDuration.hours + ':' + optDuration.minutes, "HH:mm")}
            format="HH\hr mm\min"
            minuteStep={5}
            placeholder="Select duration"
            showNow={false}
          />
        }
        <Divider type="vertical" />
        {!optDuration &&
          <Tooltip title="Add duration">
            <Button shape={shape} type={type} onClick={onAddDurationClick} size="small" icon={<HourglassOutlined />} />
          </Tooltip>}
        {!optTime &&
          <Tooltip title="Add time">
            <Button shape={shape} type={type} size="small" icon={<ClockCircleOutlined />} />
          </Tooltip>}
        {!optNotes &&
          <Tooltip title="Add description">
            <Button shape={shape} type={type} size="small" icon={<MessageOutlined />} />
          </Tooltip>}
      </span>
    </div>
  )
}
