import React, { useState } from 'react'
import { selectChallengeById, updateEntity, selectAllVirtues, selectAllVices } from '../model/tagEntitySlice'
import { useSelector, useDispatch, useStore } from 'react-redux'
import { PlusOutlined } from '@ant-design/icons'
import { Typography, List, Divider, Button, Collapse, Space, DatePicker, Input, Radio, Select, Tooltip, Menu, Dropdown } from 'antd';
import { RestrictionEditor } from './RestrictionEditor'
import { EngagementScheduleEditor } from './EngagementScheduleEditor'
import { dateAsMoment, momentAsDate } from '../kitchenSink'
import moment from 'moment';
const { Title, Text } = Typography;
const { Panel } = Collapse
const { TextArea } = Input
const { RangePicker } = DatePicker;
const { Option } = Select

/**
 * 0: {
    id: 0,
    name: "Sober october",
    description: "Total sobriety for the month",
    startDate: Date.parse("10/1/2020"),
    endDate: Date.parse("11/1/2020"),
    effects: [
      {
        id: 0,
        kind: 'VICE',
        viceRefTags: [youtube, news-media],
        restrictionId: 0
      },
      {
        id: 1,
        kind: 'VIRTUE',
        virtueRefTag: 0,
        engagementSchedule: [
          { days: [1, 3, 5], instances: [{ optTime: null, optDuration: { hour: 1, minute: 0 } }] },
          { days: [0, 6], instances: [{ optTime: { hour: 17, minute: 30 }, optDuration: { hour: 0, minute: 25 } }] },
        ]
      }
    ]
  },
 */


/** Editor for an effect dealing with vices -- for a fast */
const FastEffectEditor = ({ challengeId, effect, onEffectChange }) => {
  const allVices = useSelector(state => selectAllVices(state))
  const onViceRefTagsChange = val => {
    onEffectChange({ viceRefTags: val })
  }
  const onRestrictionIdChange = val => {
    onEffectChange({ restrictionId: val })
  }
  return (
    <Space direction='vertical' style={{ width: '100%' }}>
      <Space direction='horizontal'>
        <Text strong={true}>Vices</Text>
        <Select
          mode="tags"
          style={{ minWidth: "250px" }}
          onChange={onViceRefTagsChange} defaultValue={effect.viceRefTags} >
          {allVices.map(vice =>
            <Option key={vice.refTag}>{vice.name}</Option>
          )}
        </Select>
      </Space>
      <Space direction='vertical' style={{ width: '100%' }}>
        <Text strong={true}>Restriction</Text>
        <RestrictionEditor
          customKeyId={"C" + challengeId + "E" + effect.id}
          currentRestrictionId={effect.restrictionId}
          onRestrictionIdChange={onRestrictionIdChange}
        />
      </Space>
    </Space>
  )
}


/** Editor for an effect dealing with virtues -- for a sprint */
const SprintEffectEditor = ({ effect, onEffectChange }) => {
  const allVirtues = useSelector(state => selectAllVirtues(state))
  const onVirtueRefTagChange = val => {
    onEffectChange({ virtueRefTag: val })
  }
  const onScheduleChange = val => {
    onEffectChange({ engagementSchedule: val })
  }
  return (
    <Space direction='vertical' style={{ width: '100%' }}>
      <Space direction='horizontal'>
        <Text strong={true}>Activity</Text>
        <Select
          style={{ minWidth: "250px" }}
          onChange={onVirtueRefTagChange} defaultValue={effect.virtueRefTag} >
          {allVirtues.map(virt =>
            <Option key={virt.refTag}>{virt.name}</Option>
          )}
        </Select>
      </Space>
      <Space direction='vertical' style={{ width: '100%' }}>
        <Text strong={true}>Schedule</Text>
        <EngagementScheduleEditor
          engagementSchedule={effect.engagementSchedule}
          onScheduleChange={onScheduleChange}
        />
      </Space>
    </Space>
  )
}

/** 
 * Top level editor for dealing with a single effect of a challenge. Toggles between
 * sprints/fasts and contains the appropriate sub-editor.
 */
const EffectEditor = ({ challengeId, effect, onEffectChange }) => {
  return (
    <Space direction='vertical' style={{ width: '100%' }}>
      <Text>{effect.kind}</Text>
      {effect.kind === 'SPRINT' && <SprintEffectEditor effect={effect} onEffectChange={onEffectChange} />}
      {effect.kind === 'FAST' && <FastEffectEditor challengeId={challengeId} effect={effect} onEffectChange={onEffectChange} />}
    </Space>
  )
}

export const ChallengeEditor = ({ match }) => {
  const { challengeId } = match.params
  const dispatch = useDispatch()
  const challenge = useSelector(state => selectChallengeById(state, challengeId))
  const nextEffectId = challenge.effects.length > 0
    ? Math.max.apply(null, challenge.effects.map(e => e.id)) + 1
    : 0

  const onDescriptionChange = e => {
    dispatch(updateEntity({ tagEntityId: challengeId, changedFields: { description: e.target.value } }))
  }
  const onDateRangeChange = ([sd, ed]) => {
    const startDate = momentAsDate(sd)
    const endDate = momentAsDate(ed)
    dispatch(updateEntity({ tagEntityId: challengeId, changedFields: { startDate, endDate } }))
  }
  const onEffectChange = effectId => {
    return changedAttrs => {
      const effectIndex = challenge.effects.findIndex(effect => effect.id === effectId)
      const newEffect = {
        ...(challenge.effects[effectIndex])
      }
      Object.entries(changedAttrs).forEach(([k, v]) => newEffect[k] = v)
      const newEffects = [...challenge.effects]
      newEffects.splice(effectIndex, 1, newEffect)

      dispatch(updateEntity({ tagEntityId: challengeId, changedFields: { effects: newEffects } }))
    }
  }
  const onAddFast = e => {
    const viceRefTags = []
    const kind = 'FAST'
    const restrictionId = 1
    const newEffects = challenge.effects.concat({ id: nextEffectId, kind, viceRefTags, restrictionId })
    dispatch(updateEntity({ tagEntityId: challengeId, changedFields: { effects: newEffects } }))
  }
  const onAddSprint = e => {
    const kind = 'SPRINT'
    const virtueRefTag = "" // Should I look up a valid value?
    const engagementSchedule = []
    const newEffects = challenge.effects.concat({ id: nextEffectId, kind, virtueRefTag, engagementSchedule })
    dispatch(updateEntity({ tagEntityId: challengeId, changedFields: { effects: newEffects } }))
  }
  const width = '85%'
  const addEffectMenu = (
    <Menu>
      <Menu.Item key='fast' onClick={onAddFast}>Add Fast</Menu.Item>
      <Menu.Item key='sprint' onClick={onAddSprint}>Add Sprint</Menu.Item>
    </Menu>
  )
  if (!challenge) {
    return (<div>Unknown</div>)
  }
  return (
    <Space direction='vertical' style={{ padding: '16px', width: width }}>
      <Title level={2}>{challenge.name}</Title>
      <Space direction='horizontal'>
        <Text strong={true}>Reference tag</Text>
        <Text code={true}>#{challenge.refTag}</Text>
      </Space>
      <Space size='large' direction='horizontal'>
        <Text strong={true}>Duration</Text>
        <RangePicker
          value={[dateAsMoment(challenge.startDate), dateAsMoment(challenge.endDate)]}
          onChange={onDateRangeChange} />
      </Space>
      <Divider />
      <Space size='small' direction='vertical' style={{ width: '100%' }}>
        <Text strong={true}>Describe this challenge. What do you hope to get out of it? What was its impetus?</Text>
        <TextArea autoSize={{ minRows: 3 }} value={challenge.description} onChange={onDescriptionChange} />
      </Space>
      <Divider />
      <Space direction='vertical' style={{ width: '100%' }}>
        <Text strong={true}>Effects</Text>
        <List
          style={{ width: '100%' }}
          dataSource={challenge.effects}
          itemLayout="vertical"
          renderItem={effect =>
            <List.Item key={effect.id}>
              <EffectEditor challengeId={challengeId} effect={effect} onEffectChange={onEffectChange(effect.id)} />
            </List.Item>
          } />
      </Space>
      <Dropdown overlay={addEffectMenu} trigger={['click']}>
        <Button block size="large" type="dashed"><PlusOutlined />Add Effect</Button>
      </Dropdown>
    </Space>
  )
}