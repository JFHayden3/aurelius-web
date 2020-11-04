import React from 'react'
import {
  selectViceRestrictions
  , updateViceRestriction
  , saveSettings
  , makeCustomViceRestrictionSaved
  , deleteViceRestriction
  , computeNewSavedViceRestrictionId
} from '../model/settingsSlice'
import { ConditionEditor } from './ConditionEditor'
import { DowPicker } from './DowPicker'
import { useSelector, useDispatch } from 'react-redux'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { Typography, List, Button, Tooltip, Space, Select, Row, Col } from 'antd';

const { Text } = Typography;
const { Option } = Select

export const RestrictionEditor = (
  { customKeyId,
    onRestrictionIdChange,
    onAllRestrictionsRemoved = () => { },
    currentRestrictionId,
    allowSaving = false,
    isReadOnly = false
  }) => {
  const dispatch = useDispatch()
  const nextSavedViceRestrictionId = useSelector(state => computeNewSavedViceRestrictionId(state))
  const customKey = 'CUSTOM-FOR-' + customKeyId
  const savedViceRestrictions = useSelector(state => selectViceRestrictions(state))
  const currentRestriction = savedViceRestrictions[currentRestrictionId]
  function filterOtherCustomRestrictions([key, _]) {
    if (key.startsWith("CUSTOM-") && key !== customKey) {
      return false
    }
    return true
  }
  const onRestrictionKindSelectionChange = val => {
    onRestrictionIdChange(val)
  }
  const setRestrictionSettingName = newVal => {
    // TODO: naming length min/max
    const newKey = nextSavedViceRestrictionId
    // Setting the name saves the current (CUSTOM), spec as a new standard restriction
    // option and changes the vice to reference the saved setting
    const displayName = newVal
    dispatch(makeCustomViceRestrictionSaved({ customRestrictionKey: customKey, newKey, displayName }))
    onRestrictionIdChange(newKey)
    dispatch(saveSettings())
  }
  function dispatchAppropriateSpecChangeAction(newSpec) {
    // Changed a property of a user-created spec, just make the change directly
    if (currentRestriction.isUserCreated) {
      dispatch(updateViceRestriction(
        {
          key: currentRestrictionId,
          displayName: currentRestriction.displayName,
          spec: newSpec
        }
      ))
      dispatch(saveSettings())
    } else {
      // Changed a property of a default setting. Should create a new, "custom", spec and
      // change the vice's restriction type to it
      dispatch(updateViceRestriction(
        {
          key: customKey,
          displayName: "** Custom **",
          spec: newSpec
        }
      ))
      onRestrictionIdChange(customKey)
      dispatch(saveSettings())
    }
  }
  // Change one particluar field of one spec component of the restriction
  function changeSpecComponent(componentToChange, fieldToChange, newValue) {
    const componentIndex = currentRestriction.spec.findIndex(comp => comp === componentToChange)
    const newComponent = {
      ...componentToChange
    }
    newComponent[fieldToChange] = newValue
    const newSpec = [...currentRestriction.spec]
    newSpec.splice(componentIndex, 1, newComponent)

    dispatchAppropriateSpecChangeAction(newSpec)
  }
  const onRestrictionConditionChange = specComponent => val => {
    changeSpecComponent(specComponent, "condition", val)
  }
  const onAppliesOnChange = specComponent => val => {
    let newAppliesOn = val.sort()
    changeSpecComponent(specComponent, "appliesOn", newAppliesOn)
  }
  const onDeleteRestriction = e => {
    if (!currentRestriction.isUserCreated) {
      console.error("Cannot delete system settings")
      return;
    }
    const payload = { key: currentRestrictionId }
    onRestrictionIdChange(0)
    dispatch(deleteViceRestriction(payload))
    dispatch(saveSettings())
  }
  function onAddRestrictionComponentClick(e) {
    const newSpec = currentRestriction.spec.concat({
      appliesOn: [],
      restriction: "",
      notes: ""
    })
    dispatchAppropriateSpecChangeAction(newSpec)
  }
  const onRemoveRestrictionComponent = toRemove => e => {
    const newSpec = currentRestriction.spec.filter(s => s !== toRemove)
    dispatchAppropriateSpecChangeAction(newSpec)
    if (newSpec.length === 0) {
      onAllRestrictionsRemoved()
    }
  }
  return (
    <Space direction='vertical' style={{ width: '100%' }}>
      {!isReadOnly &&
        <Space direction='horizontal'>
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
          {currentRestrictionId === customKey && allowSaving &&
            <div>
              <Tooltip title="Create as new restriction option. Allows sharing with other vices">
                <Text editable={{ onChange: setRestrictionSettingName }} />
              </Tooltip>
            </div>
          }
          {allowSaving && currentRestriction.isUserCreated &&
            <Button type='link' onClick={onDeleteRestriction}><DeleteOutlined /></Button>}
        </Space>}
      <List itemLayout='vertical'
        dataSource={currentRestriction.spec}
        style={{ width: '100%' }}
        renderItem={specComponent =>
          <List.Item>
            <Row>
              <Col flex={2}>
                <DowPicker
                  value={specComponent.appliesOn}
                  isReadOnly={isReadOnly}
                  onChange={onAppliesOnChange(specComponent)} />
              </Col>
              <Col flex={2}>
                <div style={{ width: '100%', float: 'right' }}>
                  <ConditionEditor
                    style={{ width: '100%' }}
                    isReadOnly={isReadOnly}
                    onChange={onRestrictionConditionChange(specComponent)}
                    onDelete={onRemoveRestrictionComponent(specComponent)}
                    value={specComponent.condition} />
                </div>
              </Col>
            </Row>
          </List.Item>}>
        {!isReadOnly &&
          <List.Item>
            <Button block type="dashed" onClick={onAddRestrictionComponentClick}><PlusOutlined />Additional restrictions</Button>
          </List.Item>}
      </List>
    </Space>
  )
}