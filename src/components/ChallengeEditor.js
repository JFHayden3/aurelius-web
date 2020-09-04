import React, { useState } from 'react'
import { selectAllVices, selectViceByRefTag } from '../model/viceSlice'
import { selectAllVirtues, selectVirtueByRefTag } from '../model/virtueSlice'
import { selectChallengeById, updateChallenge } from '../model/challengeSlice'
import {
  selectViceRestrictions
  , updateViceRestriction
  , makeCustomViceRestrictionSaved
  , computeNewSavedViceRestrictionId
} from '../model/settingsSlice'
import { useSelector, useDispatch, useStore } from 'react-redux'
import { PlusOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons'
import { ViceDefaultRestrictionEditor } from './ViceDefaultRestrictionEditor'
import { Typography, List, Divider, Button, Collapse, Space, DatePicker, Input, Radio, Select } from 'antd';
import { dateAsYyyyMmDd, apiDateToFe } from '../kitchenSink'
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

// TODO Do I further subdivide this into the component that picks from the list of 
// available restrictions and the component that displays/allows editing of the individual
// restriction fields?
const RestrictionEditor = ({ customKeyId, onRestrictionIdChange, currentRestrictionId }) => {
  const customKey = 'CUSTOM-FOR-' + customKeyId
  const savedViceRestrictions = useSelector(state => selectViceRestrictions(state))
  const currentRestriction = savedViceRestrictions[currentRestrictionId]
  function filterOtherCustomRestrictions([key, _]) {
    if (key.startsWith("CUSTOM-FOR-") && key !== customKey) {
      return false
    }
    return true
  }
  const onRestrictionKindSelectionChange = val => {
    onRestrictionIdChange(val)
  }
  const onRestrictionTextChange = specComponent => val => {

  }
  const onAppliesOnChange = specComponent => val => {

  }
  return (
    <Space direction='vertical' style={{ width: '100%' }}>
      <Select value={currentRestriction.displayName}
        optionLabelProp="title"
        onChange={onRestrictionKindSelectionChange}>
        {Object.entries(savedViceRestrictions)
          .filter(filterOtherCustomRestrictions)
          .map(([key, restriction]) =>
            <Option
              key={key}
              title={restriction.displayName}
              label={restriction.displayName}>{restriction.displayName}</Option>)}
      </Select>
      <List itemLayout='vertical' dataSource={currentRestriction.spec} style={{ width: '100%' }}
        renderItem={specComponent =>
          <List.Item>
            <Space direction='horizontal' style={{ width: '100%' }}>
              <Select value={specComponent.appliesOn}
                mode="tags"
                placeholder="Days"
                onChange={onAppliesOnChange(specComponent)}
              >
                <Option value={0}>Sun</Option>
                <Option value={1}>Mon</Option>
                <Option value={2}>Tues</Option>
                <Option value={3}>Wed</Option>
                <Option value={4}>Thur</Option>
                <Option value={5}>Fri</Option>
                <Option value={6}>Sat</Option>
              </Select>

              <Text editable={{ onChange: onRestrictionTextChange(specComponent) }} style={{ width: '100%' }}>
                {specComponent.restriction}
              </Text>
            </Space>

          </List.Item>} />
    </Space>
  )
}

/** Editor for an effect dealing with vices -- for a fast */
const FastEffectEditor = ({ challengeId, effect, onEffectChange }) => {
  const state = useStore().getState()
  const allVices = useSelector(state => selectAllVices(state))
  const onViceRefTagsChange = val => {

  }
  const onRestrictionIdChange = val => {

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
  return (<div>{JSON.stringify(effect)}</div>)
}

/** 
 * Top level editor for dealing with a single effect of a challenge. Toggles between
 * sprints/fasts and contains the appropriate sub-editor.
 */
const EffectEditor = ({ effect, onEffectChange }) => {
  const onKindChange = e => {
    onEffectChange({ kind: e.target.value })
  }
  return (
    <Space direction='vertical' style={{ width: '100%' }}>
      <Radio.Group onChange={onKindChange} value={effect.kind}>
        <Radio value={'FAST'}>Fast</Radio>
        <Radio value={'SPRINT'}>Sprint</Radio>
      </Radio.Group>
      {effect.kind === 'SPRINT' && <SprintEffectEditor effect={effect} onEffectChange={onEffectChange} />}
      {effect.kind === 'FAST' && <FastEffectEditor effect={effect} onEffectChange={onEffectChange} />}
    </Space>
  )
}


export const ChallengeEditor = ({ match }) => {
  const { challengeId } = match.params
  const challenge = useSelector(state => selectChallengeById(state, challengeId))
  function dateAsMoment(date) {
    return date ? moment(date, "YYYYMMDD") : null
  }
  function momentAsDate(moment) {
    return Number.parseInt(moment.format("YYYYMMDD"))
  }
  const onDescriptionChange = val => {

  }
  const onDateRangeChange = val => {

  }
  const onEffectChange = id => {
    return changedAttrs => {

    }
  }
  const width = '85%'
  return (
    <Space direction='vertical' style={{ padding: '16px', width: width }}>
      <Title level={2}>{challenge.name}</Title>

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
              <EffectEditor effect={effect} onEffectChange={onEffectChange(effect.id)} />
            </List.Item>
          } />
      </Space>

    </Space>
  )
}