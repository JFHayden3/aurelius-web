// Renders a single task in human-readable format and a delete icon. 
// When hovered, is shown as obviously clickable. 
// When clicked, switches to task-editor view to allow editing

import React from 'react'
import { Typography, Button, Tooltip, Divider, TimePicker, Select } from 'antd';
import { ClockCircleOutlined, HourglassOutlined, MessageOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux'
import moment from 'moment';
import { selectAllVirtues } from '../model/tagEntitySlice'
import { selectTaskById, updateAgendaTask, removeAgendaTask } from '../model/journalArticlesSlice'
const { Text } = Typography;
const { Option } = Select
export const TaskListItem = ({ articleId, taskId }) => {
  const dispatch = useDispatch()
  const task = useSelector((state) => selectTaskById(state, articleId, taskId))
  const { activity, optDuration, optTime, optNotes } = task
  const allVirtues = useSelector(selectAllVirtues)
  const onActivitySelectionChange = val => {
    dispatch(updateAgendaTask({ articleId, taskId, changedFields: { activity: { content: val[val.length - 1] } } }))
  };
  const onNotesTextChange = str => {
    dispatch(updateAgendaTask({ articleId, taskId, changedFields: { optNotes: str } }))
  }
  const onAddNotesClick = e => {
    e.preventDefault()
    dispatch(updateAgendaTask({ articleId, taskId, changedFields: { optNotes: " " } }))
  }
  const onAddDurationClick = e => {
    e.preventDefault()
    dispatch(updateAgendaTask({ articleId, taskId, changedFields: { optDuration: { hour: 0, minute: 0 } } }))
  };
  const onAddTimeClick = e => {
    e.preventDefault()
    dispatch(updateAgendaTask({ articleId, taskId, changedFields: { optTime: { hour: 9, minute: 0 } } }))
  }
  const onDeleteClick = e => {
    e.preventDefault()
    dispatch(removeAgendaTask({ articleId, removeId: taskId }))
  }
  const onDurationChange = (time, timeString) => {
    let newDuration = null
    if (time) {
      newDuration = { hour: time.hours(), minute: time.minute() }
    }
    dispatch(updateAgendaTask({ articleId, taskId, changedFields: { optDuration: newDuration } }))
  }
  const onTimeChange = (time, timeString) => {
    let newTime = null
    if (time) {
      newTime = { hour: time.hour(), minute: time.minute() }
    }
    dispatch(updateAgendaTask({ articleId, taskId, changedFields: { optTime: newTime } }))
  }

  const shape = "default"
  const type = "default"
  return (
    <div>
      <span>
        <Select
          mode="tags"
          style={{ minWidth: "250px" }}
          onChange={onActivitySelectionChange} value={[activity.content]} >
          {allVirtues.map(virtue =>
            <Option key={virtue.refTag}>{virtue.name}</Option>
          )}
        </Select>
        {optNotes &&
          <Text editable={{ onChange: onNotesTextChange }}>{optNotes}</Text>
        }
        {optDuration &&
          <Tooltip title="Set duration">
            <TimePicker
              onChange={onDurationChange}
              defaultValue={moment(optDuration.hour + ':' + optDuration.minute, "HH:mm")}
              format="HH\hr mm\min"
              minuteStep={5}
              placeholder="Select duration"
              suffixIcon={<HourglassOutlined />}
              showNow={false}
            />
          </Tooltip>
        }
        {optTime &&
          <Tooltip title="Set time">
            <TimePicker
              onChange={onTimeChange}
              defaultValue={moment(optTime.hour + ':' + optTime.minute, "h:mm")}
              use12Hours={true}
              minuteStep={5}
              placeholder="Select time"
              format="h:mm a"
              suffixIcon={<ClockCircleOutlined />}
              showNow={false}
            />
          </Tooltip>
        }
        <Divider type="vertical" />
        {!optNotes &&
          <Tooltip title="Add description">
            <Button shape={shape} type={type} onClick={onAddNotesClick} size="small" icon={<MessageOutlined />} />
          </Tooltip>}
        {!optDuration &&
          <Tooltip title="Add duration">
            <Button shape={shape} type={type} onClick={onAddDurationClick} size="small" icon={<HourglassOutlined />} />
          </Tooltip>}
        {!optTime &&
          <Tooltip title="Add time">
            <Button shape={shape} type={type} onClick={onAddTimeClick} size="small" icon={<ClockCircleOutlined />} />
          </Tooltip>}
        <Tooltip title="Delete task">
          <Button shape={shape} type={type} onClick={onDeleteClick} size="small" icon={<DeleteOutlined />} />
        </Tooltip>
      </span>
    </div>
  )
}
