
import React, { useState } from 'react'
import { selectAllVirtues } from '../model/tagEntitySlice'

import { useSelector } from 'react-redux'
import { Typography, Space, Cascader, Modal, Input } from 'antd';

const { Text } = Typography;

function convertModelToPresentation(modelValue) {
  if (!modelValue) {
    return []
  }
  var presValue = modelValue.isNegation ? ['FORBIDDEN'] : ['ALLOWED']
  const interval = modelValue.details.interval
  if (modelValue.details.condition) {
    presValue.push(modelValue.details.condition)
  } else if (interval.begin.kind === interval.end.kind) {
    switch (interval.begin.kind) {
      case 'TIME':
        presValue.push('BETWEEN')
        presValue.push(interval.begin.spec)
        presValue.push(interval.end.spec)
        break;
      case 'ACTIVITY':
        presValue.push('DURING')
        // TODO: disambiguate custom vs standard here
        presValue.push(interval.begin.spec)
        break;
      case 'OPEN':
        presValue.push('ENTIRELY')
        break;
    }
  }
  else { // begin kind != end kind
    // We know that one end has to be open
    const closedIntervalSide = interval.begin.kind === 'OPEN' ? interval.end : interval.begin
    presValue.push(closedIntervalSide === interval.end ? 'BEFORE' : 'AFTER')
    presValue.push(closedIntervalSide.kind === 'TIME' ? 'SPECIFIC_TIME' : 'ACTIVITY')
    // TODO: maybe: disambiguate custom activity here
    presValue.push(closedIntervalSide.spec)
  }

  return presValue
}

function convertPresentationToModel(presValue) {
  if (presValue.length === 0) {
    return null
  }
  const modelValue = {
    isNegation: presValue[0] === 'FORBIDDEN'
    , details: {}
  }

  var intervalBegin = null
  var intervalEnd = null
  function extractIntervalPointFromPres(presValue) {
    const kind = presValue[2] === 'SPECIFIC_TIME' ? 'TIME' : 'ACTIVITY'
    const spec = presValue[3] === 'CUSTOM_ACTIVITY' ? presValue[4] : presValue[3]
    return { kind, spec }
  }
  switch (presValue[1]) {
    case 'BEFORE':
      intervalBegin = { kind: 'OPEN', spec: null }
      intervalEnd = extractIntervalPointFromPres(presValue)
      break;
    case 'AFTER':
      intervalBegin = extractIntervalPointFromPres(presValue)
      intervalEnd = { kind: 'OPEN', spec: null }
      break;
    case 'BETWEEN':
      intervalBegin = { kind: 'TIME', spec: presValue[2] }
      intervalEnd = { kind: 'TIME', spec: presValue[3] }
      break;
    case 'DURING':
      intervalBegin = intervalEnd = {
        kind: 'ACTIVITY',
        spec: presValue[2] === 'CUSTOM_ACTIVITY' ? presValue[3] : presValue[2]
      }
      break;
    case 'ENTIRELY':
      intervalBegin = intervalEnd = { kind: 'OPEN', spec: null }
      break;
    case 'CUSTOM_CONDITION':
      modelValue.details.condition = presValue[2]
      break;
  }
  modelValue.details.interval = { begin: intervalBegin, end: intervalEnd }
  return modelValue
}

function conditionAsHumanReadable(selectedPresOptions) {
  function optionToHuman(optVal) {
    switch (optVal.value) {
      case 'ALLOWED':
      case 'FORBIDDEN':
        return optVal.label
      case 'SPECIFIC_TIME':
      case 'ACTIVITY':
        return null
      case 'BEFORE':
      case 'AFTER':
      case 'BETWEEN':
      case 'DURING':
      case 'ENTIRELY':
        return optVal.label.toLowerCase()
      case 'CUSTOM_CONDITION':
      case 'CUSTOM_ACTIVITY':
        return '...'
      default:
        return optVal.label
    }
  }
  const readableStrs = selectedPresOptions.map(opt => optionToHuman(opt))
  const betweenIndex = readableStrs.findIndex(s => s === 'between')
  if (betweenIndex > 0) {
    readableStrs.splice(betweenIndex + 2, 0, 'and')
  }
  return readableStrs.join(' ')
}

export const ConditionEditor = ({ value, onChange }) => {
  const [showCustomActivityModal, setShowCustomActivityModal] = useState(false)
  const [customActivityText, setCustomActivityText] = useState("")
  const [customActivityPreamble, setCustomActivityPreamble] = useState([])
  const onCustomActivityModalOk = e => {
    setShowCustomActivityModal(false)
    if (customActivityText !== "") {
      onChange(convertPresentationToModel(
        customActivityPreamble.map(opt => opt.value).concat([customActivityText])))
    }
  }
  const onCustomActivityModalCancel = e => {
    setShowCustomActivityModal(false)
  }

  const allVirtues = useSelector(state => selectAllVirtues(state))
  const activityOptions = allVirtues.map(virtue => {
    return { value: virtue.refTag, label: virtue.name }
  })
  activityOptions.push({ value: 'CUSTOM_ACTIVITY', label: 'Other...', openModal: true })
  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  const hourOptions =
    hours.map(h => { return { value: (h % 12), label: (h + ":00am") } })
      .concat(
        hours.map(h => { return { value: (h % 12) + 12, label: (h + ":00pm") } })
      )

  const temporalPredicates = [
    {
      value: 'SPECIFIC_TIME',
      label: 'Specific time',
      children: hourOptions
    },
    {
      value: 'ACTIVITY',
      label: 'Activity',
      children: activityOptions
    }
    // TODO: informal time maybe?
  ]
  const topLevelPredicates = [
    {
      value: 'BEFORE',
      label: 'Before',
      children: temporalPredicates
    },
    {
      value: 'AFTER',
      label: 'After',
      children: temporalPredicates
    },
    {
      value: 'BETWEEN',
      label: "Between",
      children: hourOptions.map(opt => {
        const copy = { ...opt }
        copy.children = hourOptions.filter(ho => ho.value > opt.value)
        return copy
      })
    },
    {
      value: 'DURING',
      label: 'During',
      children: activityOptions
    },
    {
      value: 'ENTIRELY',
      label: 'Entirely'
    },
    {
      value: 'CUSTOM_CONDITION',
      label: 'Other...',
      openModal: true,
    }
  ]
  const options = [
    {
      value: 'ALLOWED',
      label: 'Allowed',
      children: topLevelPredicates,
    },
    {
      value: 'FORBIDDEN',
      label: "Forbidden",
      children: topLevelPredicates
    }
  ]
  const onCascaderSelectionChange = (val, selectedOptions) => {
    if (selectedOptions[selectedOptions.length - 1].openModal) {
      setCustomActivityPreamble(selectedOptions)
      setShowCustomActivityModal(true)
    } else {
      const modelValue = convertPresentationToModel(val)
      onChange(modelValue)
    }
  }
  const displayRender = (label, selectedOptions) => {
    return (
      conditionAsHumanReadable(selectedOptions)
    )
  }
  const presVal = convertModelToPresentation(value)
  var i = 0
  var presValOptionsLevel = options
  while (i < presVal.length) {
    // Either find the corresponding value in the presentation options, or add it 
    // This allows us to nicely handle custom conditions/activities
    var opt = presValOptionsLevel.find(opt => opt.value === presVal[i])
    if (!opt) {
      opt = { value: presVal[i], label: presVal[i], children: [] }
      presValOptionsLevel.push(opt)
    }
    ++i
    presValOptionsLevel = opt.children ?? []
  }
  return (
    <div>
      <Cascader style={{ width: '285px' }} displayRender={displayRender} value={presVal} options={options} onChange={onCascaderSelectionChange} />
      <Modal
        onOk={onCustomActivityModalOk}
        onCancel={onCustomActivityModalCancel}
        visible={showCustomActivityModal}>
        <Space direction='horizontal'>
          <Text strong={true}>{conditionAsHumanReadable(customActivityPreamble)}</Text>
          <Input value={customActivityText} maxLength={40} onChange={e => setCustomActivityText(e.target.value)}></Input>
        </Space>
      </Modal>

    </div>
  )
}