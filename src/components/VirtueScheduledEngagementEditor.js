import React, { useState } from 'react'
import moment from 'moment';
import { useSelector, useDispatch, useStore } from 'react-redux'
import { PlusOutlined, ClockCircleOutlined, HourglassOutlined, MessageOutlined, DeleteOutlined } from '@ant-design/icons'
import { Typography, Row, Col, Button, Divider, Select, TreeSelect, Tooltip, TimePicker } from 'antd';
import { updateEntity } from '../model/tagEntitySlice';

const { Option } = Select
const { TreeNode } = TreeSelect
const { Text, } = Typography;

export const VirtueScheduledEngagementEditor = ({ virtue }) => {
  const dispatch = useDispatch()
  const engagementSchedule = virtue.engagementSchedule
  function changeScheduleComponentField(scheduleComponent, fieldName, value) {
    const compIndex = engagementSchedule.findIndex(s => s === scheduleComponent)
    const newComp = {
      ...scheduleComponent
    }
    newComp[fieldName] = value
    const newEngagementSchedule = [...engagementSchedule]
    newEngagementSchedule.splice(compIndex, 1, newComp)
    dispatch(updateEntity({ tagEntityId: virtue.id, changedFields: { engagementSchedule: newEngagementSchedule } }))
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
    const newRecurringAppointment = { days: [], instances:[] }
    const newEngagementSchedule = virtue.engagementSchedule.concat(newRecurringAppointment)
    dispatch(updateEntity({ tagEntityId: virtue.id, changedFields: { engagementSchedule: newEngagementSchedule } }))
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
      changeEngagementInstanceField(appt, instance, "optDuration", newDuration)    }
  }
 
  return (
    <Col flex='auto'>
      <div>
        {engagementSchedule.map(sched =>
          <Row>
            <Col >
              <TreeSelect
                showSearch
                style={{minWidth:200}}
                value={sched.days}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                placeholder="Days"
                allowClear
                multiple
                treeDefaultExpandAll
                onChange={onDaysChange(sched)}
              >
                <TreeNode value={1} title="Monday" />
                <TreeNode value={2} title="Tuesday" />
                <TreeNode value={3} title="Wednesday" />
                <TreeNode value={4} title="Thursday" />
                <TreeNode value={5} title="Friday" />
                <TreeNode value={0} title="Sunday" />
                <TreeNode value={6} title="Saturday" />
              </TreeSelect>
            </Col>
            <Col >
              {sched.instances.map(instance =>
                <div>
                  {!instance.optTime &&
                    <Tooltip title="Set time">
                      <Button onClick={onSetTimeClick(sched, instance)}  icon={<ClockCircleOutlined />} />
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
                </div>
              )}
              <Button type="dashed" onClick={onAddInstanceClick(sched)}><PlusOutlined />Add Instance</Button>
            </Col>
            <Divider></Divider>
          </Row>
        )}
        <Button type="dashed" onClick={onAddRecurringAppointmentClick}><PlusOutlined />Add Recurring Appointment</Button>
      </div>
    </Col>
  )
}