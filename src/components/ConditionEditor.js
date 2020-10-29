
import React, { useState } from 'react'
import { selectAllVirtues } from '../model/tagEntitySlice'

import { useSelector } from 'react-redux'
import { Typography, Space, Cascader, Modal, Input } from 'antd';
import { RestrictionConversion } from '../kitchenSink'

const { Text } = Typography;

function createOption({ value, children = null, label = null, openModal = false }) {
  return {
    value,
    children,
    label: label ? label : RestrictionConversion.getLabel(value),
    openModal
  }
}

export const ConditionEditor = ({ value, onChange, isReadOnly }) => {
  const [showCustomActivityModal, setShowCustomActivityModal] = useState(false)
  const [customActivityText, setCustomActivityText] = useState("")
  const [customActivityPreamble, setCustomActivityPreamble] = useState([])
  const onCustomActivityModalOk = e => {
    setShowCustomActivityModal(false)
    if (customActivityText !== "") {
      onChange(RestrictionConversion.convertPresentationToModel(
        customActivityPreamble.map(opt => opt.value).concat([customActivityText])))
    }
  }
  const onCustomActivityModalCancel = e => {
    setShowCustomActivityModal(false)
  }
  const allVirtues = useSelector(state => selectAllVirtues(state))
  const activityOptions = allVirtues.map(virtue => {
    return createOption({ value: virtue.refTag, label: virtue.name })
  })
  activityOptions.push(createOption({ value: 'CUSTOM_ACTIVITY', openModal: true }))
  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  const hourOptions =
    hours.map(h => createOption({ value: (h % 12) }))
      .concat(
        hours.map(h => createOption({ value: (h % 12) + 12 }))
      )

  const temporalPredicates = [
    createOption({ value: 'SPECIFIC_TIME', children: hourOptions }),
    createOption({ value: 'ACTIVITY', children: activityOptions })
    // TODO: informal time maybe?
  ]
  const topLevelPredicates = [
    createOption({ value: 'BEFORE', children: temporalPredicates }),
    createOption({ value: 'AFTER', children: temporalPredicates }),
    createOption({
      value: 'BETWEEN',
      children: hourOptions.map(opt => {
        const copy = { ...opt }
        copy.children = hourOptions.filter(ho => ho.value > opt.value)
        return copy
      })
    }),
    createOption({ value: 'DURING', children: activityOptions }),
    createOption({ value: 'ENTIRELY' }),
    createOption({ value: 'CUSTOM_CONDITION', openModal: true })
  ]
  const options = [
    createOption({ value: 'ALLOWED', children: topLevelPredicates, }),
    createOption({ value: 'FORBIDDEN', children: topLevelPredicates })
  ]
  const onCascaderSelectionChange = (val, selectedOptions) => {
    if ((selectedOptions[selectedOptions.length - 1] ?? {}).openModal) {
      setCustomActivityPreamble(selectedOptions)
      setShowCustomActivityModal(true)
    } else {
      const modelValue = RestrictionConversion.convertPresentationToModel(val)
      onChange(modelValue)
    }
  }
  const displayRender = (label, selectedOptions) => {
    return (
      RestrictionConversion.prettyPrintRestriction(selectedOptions)
    )
  }
  // This algorithm does two things:
  // primarily, it fixes up the available options to include anything missing from
  // the selected value (mainly to handle the 'CUSTOM_CONDITION/CUSTOM_ACTIVITY case)
  // and second, it builds the array of our currently selected options so we can convert
  // that to human readable (the human-readable algorithm operates on options rather than labels
  // or model value) for the readonly display
  const presVal = RestrictionConversion.convertModelToPresentation(value)
  var i = 0
  var presValOptionsLevel = options
  const selectedOptions = []
  while (i < presVal.length) {
    // Either find the corresponding value in the presentation options, or add it 
    // This allows us to nicely handle custom conditions/activities
    var opt = presValOptionsLevel.find(opt => opt.value === presVal[i])
    if (!opt) {
      opt = createOption({ value: presVal[i] })
      presValOptionsLevel.push(opt)
    }
    selectedOptions.push(opt)
    ++i
    presValOptionsLevel = opt.children ?? []
  }
  const selectionAsHumanReadable = RestrictionConversion.prettyPrintRestriction(selectedOptions)
  return (
    <div>
      {!isReadOnly &&
        <Cascader style={{ width: '285px' }}
          displayRender={displayRender}
          value={presVal}
          placeholder="Choose condition"
          options={options}
          onChange={onCascaderSelectionChange} />}
      {isReadOnly && <Text>{selectionAsHumanReadable}</Text>}
      <Modal
        onOk={onCustomActivityModalOk}
        onCancel={onCustomActivityModalCancel}
        visible={showCustomActivityModal}>
        <Space direction='horizontal'>
          <Text strong={true}>{RestrictionConversion.prettyPrintRestriction(customActivityPreamble)}</Text>
          <Input value={customActivityText} maxLength={40} onChange={e => setCustomActivityText(e.target.value)}></Input>
        </Space>
      </Modal>

    </div>
  )
}