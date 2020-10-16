
import React from 'react'
import { PlusOutlined, ClockCircleOutlined, HourglassOutlined } from '@ant-design/icons'
import { TimePicker, Divider, Button, Space, Select, Tooltip, } from 'antd';
import { DowPicker } from './DowPicker'
import moment from 'moment';
const { Option } = Select


export const EngagementScheduleEditor = ({ engagementSchedule, onScheduleChange }) => {
  function changeScheduleComponentField(scheduleComponent, fieldName, value) {
    const compIndex = engagementSchedule.findIndex(s => s === scheduleComponent)
    const newComp = {
      ...scheduleComponent
    }
    newComp[fieldName] = value
    const newEngagementSchedule = [...engagementSchedule]
    newEngagementSchedule.splice(compIndex, 1, newComp)
    onScheduleChange(newEngagementSchedule)
  }
  function onScheduleComponentChange(scheduleComponent, fieldName) {
    return (value) =>
      changeScheduleComponentField(scheduleComponent, fieldName, value)
  }

  function onDaysChange(appt) {
    return onScheduleComponentChange(appt, "days")
  }

  function changeEngagementInstanceField(appt, instance, fieldName, value) {
    const instIndex = appt.instances.findIndex(i => i === instance)
    const newInstance = {
      ...instance
    }
    newInstance[fieldName] = value
    const newInstanceList = [...appt.instances]
    newInstanceList.splice(instIndex, 1, newInstance)
    changeScheduleComponentField(appt, "instances", newInstanceList)
  }

  function onAddInstanceClick(appt) {
    return e => {
      const newEngagementInstance = { optTime: null, optDuration: null }
      const newInstances = appt.instances.concat(newEngagementInstance)
      changeScheduleComponentField(appt, "instances", newInstances)
    }
  }

  function onAddRecurringAppointmentClick(e) {
    const newRecurringAppointment = { days: [], instances: [] }
    const newEngagementSchedule = engagementSchedule.concat(newRecurringAppointment)
    onScheduleChange(newEngagementSchedule)
  }

  function onSetTimeClick(appt, instance) {
    return (e) => changeEngagementInstanceField(appt, instance, "optTime", { hour: 9, minute: 0 })
  }

  function onTimeChange(appt, instance) {
    return (time, timeString) => {
      const newTime = time ? { hour: time.hour(), minute: time.minute() } : null
      changeEngagementInstanceField(appt, instance, "optTime", newTime)
    }
  }
  function onSetDurationClick(appt, instance) {
    return (e) => changeEngagementInstanceField(appt, instance, "optDuration", { hour: 0, minute: 30 })
  }

  function onDurationChange(appt, instance) {
    return (time, timeString) => {
      const newDuration = time ? { hour: time.hour(), minute: time.minute() } : null
      changeEngagementInstanceField(appt, instance, "optDuration", newDuration)
    }
  }

  return (
    <Space direction='vertical'>
      {engagementSchedule.map(sched =>
        <Space direction='horizontal' align='start'>
          <DowPicker value={sched.days} onChange={onDaysChange(sched)}/>
          <Space direction='vertical' >
            {sched.instances.map(instance =>
              <Space direction='horizontal'>
                {!instance.optTime &&
                  <Tooltip title="Set time">
                    <Button onClick={onSetTimeClick(sched, instance)} icon={<ClockCircleOutlined />} />
                  </Tooltip>}
                {instance.optTime &&
                  <Tooltip title="Set time">
                    <TimePicker
                      onChange={onTimeChange(sched, instance)}
                      defaultValue={moment(instance.optTime.hour + ':' + instance.optTime.minute, "h:mm")}
                      use12Hours={true}
                      minuteStep={5}
                      placeholder="Select time"
                      format="h:mm a"
                      suffixIcon={<ClockCircleOutlined />}
                      showNow={false}
                    />
                  </Tooltip>}
                {!instance.optDuration &&
                  <Tooltip title="Set duration">
                    <Button onClick={onSetDurationClick(sched, instance)} icon={<HourglassOutlined />} />
                  </Tooltip>}
                {instance.optDuration &&
                  <Tooltip title="Set duration">
                    <TimePicker
                      onChange={onDurationChange(sched, instance)}
                      defaultValue={moment(instance.optDuration.hour + ':' + instance.optDuration.minute, "HH:mm")}
                      format="HH\hr mm\min"
                      minuteStep={5}
                      placeholder="Select duration"
                      suffixIcon={<HourglassOutlined />}
                      showNow={false}
                    />
                  </Tooltip>
                }
              </Space>
            )}
            <Button type="dashed" onClick={onAddInstanceClick(sched)}><PlusOutlined />Add Instance</Button>
          </Space>
          <Divider></Divider>
        </Space>
      )}
      <Button type="dashed" onClick={onAddRecurringAppointmentClick}><PlusOutlined />Add Recurring Appointment</Button>
    </Space>
  )
}