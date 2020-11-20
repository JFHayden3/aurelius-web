import React from 'react'
import { PlusOutlined, ClockCircleOutlined, HourglassOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons'
import { TimePicker, Row, Col, Button, Space, Tooltip, Popover, Typography, List } from 'antd';
import { DowPicker } from './DowPicker'
import moment from 'moment';
import { makeNumTwoDigit } from '../kitchenSink'
import { groupBy, sortBy, isNumber, capitalize } from 'lodash'
const { Text } = Typography

function humanReadableEngagementInstances(instances, maxLength = 500) {
  if (!instances || instances.length === 0) {
    return "Set times"
  }

  const sortedInstances = sortBy(instances, getInstanceSortKey)
  const instCountStr = (instCount, isLastInstance) => {
    switch (instCount) {
      case 1:
        return isLastInstance ? 'once more' : 'once'
      case 2:
        return isLastInstance ? 'twice more' : 'twice'
      default:
        const seperator = isLastInstance ? ' more ' : ' '
        return instCount + seperator + 'times'
    }
  }
  const optTimeToTimeStr = optTime => moment(optTime.hour + ':' + optTime.minute, "h:mm").format("h:mm a")
  const optDurationToStr = optDuration => {
    if (!optDuration) {
      return null
    }
    var durationStr = ""
    if (optDuration.hour !== 0) {
      durationStr += optDuration.hour
      durationStr += optDuration.hour > 1 ? "hrs " : "hr "
    }
    if (optDuration.minute !== 0) {
      durationStr += optDuration.minute
      durationStr += optDuration.minute > 1 ? "mins" : "min"
    }
    return durationStr
  }
  const specTimeInstances = sortedInstances.filter(inst => inst.optTime)
  const noTimeInstaces = Object.values(groupBy(
    sortedInstances.filter(inst => !inst.optTime),
    inst => JSON.stringify(inst.optDuration)))
  const specTimeInstanceStrs = specTimeInstances.map(
    inst => inst.optDuration
      ? optTimeToTimeStr(inst.optTime) + ' for ' + optDurationToStr(inst.optDuration)
      : optTimeToTimeStr(inst.optTime))

  const noTimeInstanceStrs = noTimeInstaces.map((insts, index) => {
    const isLastInstanceGroup = index === noTimeInstaces.length - 1
      && specTimeInstances.concat(noTimeInstaces).length > 1 // 'Last' implies more than one group
    const instCount = instCountStr(insts.length, isLastInstanceGroup)
    return insts[0].optDuration
      ? instCount + ' for ' + optDurationToStr(insts[0].optDuration)
      : instCount
  })

  const allInstanceStrs = specTimeInstanceStrs.concat(noTimeInstanceStrs)
  if (allInstanceStrs.length > 1) {
    allInstanceStrs[allInstanceStrs.length - 1] = 'and ' + allInstanceStrs[allInstanceStrs.length - 1]
  }
  const joinedStrs = allInstanceStrs.join(', ')
  return joinedStrs.substr(0, maxLength) + (joinedStrs.length > maxLength ? '...' : '')
}

const getInstanceSortKey = inst => {
  const th = inst.optTime ? makeNumTwoDigit(inst.optTime.hour) : '99'
  const tm = inst.optTime ? makeNumTwoDigit(inst.optTime.minute) : '99'

  const dh = inst.optDuration ? makeNumTwoDigit(inst.optDuration.hour) : '99'
  const dm = inst.optDuration ? makeNumTwoDigit(inst.optDuration.minute) : '99'

  return th + tm + dh + dm
}

const SchedComponent = ({ sched, changeScheduleComponentField, removeComponent, isReadOnly, maxTextLength }) => {
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
      const ids = appt.instances.map(i => i.key).filter(key => isNumber(key))
      const key = ids.length > 0 ? Math.max.apply(null, ids) + 1 : 0
      const newEngagementInstance = { optTime: null, optDuration: null, key }
      const newInstances = appt.instances.concat(newEngagementInstance)
      changeScheduleComponentField(appt, "instances", newInstances)
    }
  }

  const onRemoveInstanceClick = (appt, toRemove) => e => {
    const newInstances = appt.instances.filter(inst => inst !== toRemove)
    changeScheduleComponentField(appt, 'instances', newInstances)
  }

  function onDaysChange(appt) {
    return value => {
      changeScheduleComponentField(appt, "days", value)
    }
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

  const humanReadableTextAbbrev = capitalize(humanReadableEngagementInstances(sched.instances, maxTextLength))
  const humanReadableTextFull = capitalize(humanReadableEngagementInstances(sched.instances))

  return (
    <Row>
      <Col flex={2}>
        <DowPicker value={sched.days} onChange={onDaysChange(sched)} isReadOnly={isReadOnly} />
      </Col>
      <Col flex={2}>
        <div style={{ float: 'right' }}>
          <Popover trigger={isReadOnly ? [] : 'click'} placement='bottom' content={
            <Space direction='vertical' >
              {sortBy(sched.instances, getInstanceSortKey).map(instance =>
                <Space direction='horizontal' key={instance.key}>
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
                  <Tooltip title='Remove'>
                    <Button type='text' onClick={onRemoveInstanceClick(sched, instance)} icon={<CloseOutlined />} />
                  </Tooltip>
                </Space>
              )}
              <Button type="dashed" onClick={onAddInstanceClick(sched)}><PlusOutlined />Add Instance</Button>
            </Space>
          }>
            <Tooltip title={humanReadableTextFull} placement='top' mouseEnterDelay={.2}>
              {!isReadOnly &&
                <Button>
                  {humanReadableTextAbbrev}
                </Button>}
              {isReadOnly &&
                <Text>
                  {humanReadableTextAbbrev}
                </Text>}
            </Tooltip>
          </Popover>
          {!isReadOnly &&
            <Tooltip title='Remove'>
              <Button type='text' onClick={removeComponent(sched)} icon={<DeleteOutlined />} />
            </Tooltip>}
        </div>
      </Col>
    </Row>
  )
}

export const EngagementScheduleEditor = ({ engagementSchedule, onScheduleChange, isReadOnly = false, maxSchedTextLength }) => {
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

  function onAddRecurringAppointmentClick(e) {
    const newRecurringAppointment = { days: [], instances: [{ optTime: null, optDuration: null, key: 0 }] }
    const newEngagementSchedule = engagementSchedule.concat(newRecurringAppointment)
    onScheduleChange(newEngagementSchedule)
  }

  const onRemoveRecurringAppointmentClick = toRemove => e => {
    const newEngagementSchedule = engagementSchedule.filter(appt => appt !== toRemove)
    onScheduleChange(newEngagementSchedule)
  }


  return (
    <List
      dataSource={engagementSchedule}
      itemLayout='vertical' style={{ width: '100%' }}
      renderItem={sched =>
        <List.Item>
          <SchedComponent
            sched={sched}
            isReadOnly={isReadOnly}
            changeScheduleComponentField={changeScheduleComponentField}
            removeComponent={onRemoveRecurringAppointmentClick}
            maxTextLength={maxSchedTextLength}
          />
        </List.Item>
      }>
      {!isReadOnly &&
        <List.Item>
          <Button type="dashed" onClick={onAddRecurringAppointmentClick}>
            <PlusOutlined />Add Recurring Appointment
        </Button>
        </List.Item>}
    </List>
  )
}