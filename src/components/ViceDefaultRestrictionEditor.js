import React, { useState } from 'react'
import { updateVice } from '../model/viceSlice'
import {
  selectViceRestrictions,
  updateViceRestriction,
  computeNewSavedViceRestrictionId,
  makeCustomViceRestrictionSaved,
  saveSettings
} from '../model/settingsSlice'
import { useSelector, useDispatch, useStore } from 'react-redux'
import { PlusOutlined } from '@ant-design/icons'
import { Typography, Row, Col, Button, Select, TreeSelect, Tooltip } from 'antd';

const { Option } = Select
const { TreeNode } = TreeSelect
const {  Text,} = Typography;


export const ViceDefaultRestrictionEditor = ({ vice }) => {
  const customForViceId = "CUSTOM-FOR-" + vice.id
  const dispatch = useDispatch()
  const state = useStore().getState()
  const savedViceRestrictions = useSelector(selectViceRestrictions)
  // TODO deal with cases where the spec has been removed better
  if (
    !savedViceRestrictions[vice.defaultEngagementRestriction.kind]) {
    dispatch(updateVice({
      viceId: vice.id,
      changedFields: {
        // reset to default
        defaultEngagementRestriction: { kind: "0" }
      },
    }))
    return (<div></div>)
  }

  const currentRestriction = savedViceRestrictions[vice.defaultEngagementRestriction.kind]

  const setRestrictionSettingName = newVal => {
    const newKey = computeNewSavedViceRestrictionId(state)
    // Setting the name saves the current (CUSTOM), spec as a new standard restriction
    // option and changes the vice to reference the saved setting
    const displayName = newVal
    const customRestrictionKey = customForViceId
    dispatch(makeCustomViceRestrictionSaved({ customRestrictionKey, newKey, displayName }))
    dispatch(updateVice({
      viceId: vice.id,
      changedFields: {
        // Spec now comes from settings
        defaultEngagementRestriction: { kind: newKey }
      },
    }))
    dispatch(saveSettings())
  }
  const onRestrictionKindSelectionChange = newKind => {
    dispatch(updateVice(
      {
        viceId: vice.id,
        changedFields: { defaultEngagementRestriction: { kind: newKind } }
      }))
  }

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
  function onAppliesOnChange(specComponent) {
    return val => {
      let newAppliesOn = val.sort()
      changeSpecComponent(specComponent, "appliesOn", newAppliesOn)
    }
  }
  function onRestrictionTextChange(specComponent) {
    return val => {
      changeSpecComponent(specComponent, "restriction", val)
    }
  }
  function onNotesChange(specComponent) {
    return val => {
      changeSpecComponent(specComponent, "notes", val)
    }
  }
  function onAddRestrictionComponentClick(e) {
    const newSpec = currentRestriction.spec.concat({
      appliesOn: [],
      restriction: "",
      notes: ""
    })
    dispatchAppropriateSpecChangeAction(newSpec)
  }

  function dispatchAppropriateSpecChangeAction(newSpec) {
    const restrictionKind = vice.defaultEngagementRestriction.kind
    // Changed a property of a user-created spec, just make the change directly
    if (currentRestriction.isUserCreated) {
      dispatch(updateViceRestriction(
        {
          key: restrictionKind,
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
          key: customForViceId,
          displayName: "** Custom **",
          spec: newSpec
        }
      ))
      dispatch(updateVice({
        viceId: vice.id,
        changedFields: { defaultEngagementRestriction: { kind: customForViceId } }
      }))
    }
  }
  function filterOtherCustomRestrictions([key, _]) {
    if (key.startsWith("CUSTOM-FOR") && key !== customForViceId) {
      return false
    }
    return true
  }
  return (
    <Col flex='auto'>
      <Row>
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
        {vice.defaultEngagementRestriction.kind === customForViceId &&
          <div>
            <Tooltip title="Create as new restriction option. Allows easy sharing with other vices">
              <Text editable={{ onChange: setRestrictionSettingName }} />
            </Tooltip>
          </div>
        }
      </Row>
      <Row>
        <Col flex='auto'>
          <Row>
            <Col flex={1}>
              <div>
                Applies on
          </div>
            </Col>
            <Col flex={1}>
              <div>
                Restriction
          </div>
            </Col>
            <Col flex={1}>
              <div>
                Additional notes
          </div>
            </Col>
          </Row>
          {currentRestriction.spec.map(specComponent =>
            <Row>
              <Col flex={1}>
                <TreeSelect
                  showSearch
                  style={{ width: '100%' }}
                  value={specComponent.appliesOn}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  placeholder="Applies to"
                  allowClear
                  multiple
                  treeDefaultExpandAll
                  onChange={onAppliesOnChange(specComponent)}
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
              <Col flex={1}>
                <Text editable={{ onChange: onRestrictionTextChange(specComponent) }}>
                  {specComponent.restriction}
                </Text>
              </Col>
              <Col flex={1}>
                <Text editable={{ onChange: onNotesChange(specComponent) }}>
                  {specComponent.notes}
                </Text>
              </Col>
            </Row>
          )}
          <Row>
            <Button block type="dashed" onClick={onAddRestrictionComponentClick}><PlusOutlined />Additional restrictions</Button>
          </Row>
        </Col>
      </Row>
    </Col>
  )
}