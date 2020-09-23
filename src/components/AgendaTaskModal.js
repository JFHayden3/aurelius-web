
import React, { useState } from 'react'
import { Typography, Button, Tooltip, Divider, TimePicker, Select, Input, Modal, Space } from 'antd';
import { ClockCircleOutlined, HourglassOutlined, MessageOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux'
import moment from 'moment';
import { selectAllVirtues } from '../model/tagEntitySlice'
import { selectTaskById, updateAgendaTask, removeAgendaTask } from '../model/journalArticlesSlice'
import { setAuthUser } from '../model/metaSlice';

const { TextArea } = Input
const { Text } = Typography;
const { Option } = Select

export const AgendaTaskModal = ({ agendaTask, isVisible, onConfirm, onCancel }) => {
  const [activityContent, setActivityContent] = useState(agendaTask.activity.content)
  const [duration, setDuration] = useState(agendaTask.optDuration)
  const [time, setTime] = useState(agendaTask.optTime)
  const [notes, setNotes] = useState(agendaTask.optNotes)
  // setActivityContent(agendaTask.activity.content)
  // setDuration(agendaTask.optDuration)
  // setTime(agendaTask.optTime)
  // setNotes(agendaTask.optNotes)
  const allVirtues = useSelector(selectAllVirtues)
  const onActivitySelectionChange = val => {
    setActivityContent(val[val.length - 1])
  }
  const onNotesChange = e => {
    setNotes(e.target.value)
  }
  const onTimeChange = (time, timeString) => {
    let newTime = null
    if (time) {
      newTime = { hour: time.hour(), minute: time.minute() }
    }
    setTime(newTime)
  }
  const onDurationChange = (time, timeString) => {
    let newDuration = null
    if (time) {
      newDuration = { hour: time.hours(), minute: time.minute() }
    }
    setDuration(newDuration)
  }
  const onConfirmClick = e => {
    e.preventDefault()
    const activity = { content: activityContent }
    const optDuration = duration
    const optTime = time
    const optNotes = notes
    onConfirm(agendaTask.id, { activity, optDuration, optTime, optNotes })
  }
  const onAddTimeClick = e => {
    setTime({ hour: 9, minute: 0 })
  }
  const onAddDurationClick = e => {
    setDuration({ hour: 0, minute: 45 })
  }
  return (
    <Modal
      visible={isVisible}
      onOk={onConfirmClick}
      onCancel={onCancel}>
      <Space direction='vertical' size='small'>
        <Space direction='horizontal'>
          <Text strong={true}>Activity *</Text>
          <Select
            mode="tags"
            style={{ minWidth: "250px" }}
            onChange={onActivitySelectionChange} value={[activityContent]} >
            {allVirtues.map(virtue =>
              <Option key={virtue.refTag}>{virtue.name}</Option>
            )}
          </Select>
        </Space>
        <Space direction='vertical' size='small' style={{ width: '100%' }}>
          <Text strong={true}>Details</Text>
          <TextArea autoSize={{ minRows: 3 }} value={notes} onChange={onNotesChange} />
        </Space>
        {!time &&
          <Button onClick={onAddTimeClick} block size="large" type="dashed"><ClockCircleOutlined />Add Time</Button>
        }
        {time && <Space direction='horizontal'>
          <Text strong={true}>Time</Text>
          <TimePicker
            onChange={onTimeChange}
            defaultValue={moment(time.hour + ':' + time.minute, "h:mm")}
            use12Hours={true}
            minuteStep={5}
            placeholder="Select time"
            format="h:mm a"
            suffixIcon={<ClockCircleOutlined />}
            showNow={false}
          />
        </Space>}
        {!duration &&
          <Button onClick={onAddDurationClick} block size="large" type="dashed"><HourglassOutlined />Add Duration</Button>
        }
        {duration && <Space direction='horizontal'>
          <Text strong={true}>Duration</Text>
          <TimePicker
            onChange={onDurationChange}
            defaultValue={moment(duration.hour + ':' + duration.minute, "HH:mm")}
            format="HH\hr mm\min"
            minuteStep={5}
            placeholder="Select duration"
            suffixIcon={<HourglassOutlined />}
            showNow={false}
          />
        </Space>}
      </Space>
    </Modal>
  )
}