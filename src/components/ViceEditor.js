import React from 'react'
import { selectViceById, updateVice } from '../model/viceSlice'
import { selectViceRestrictions } from '../model/settingsSlice'
import { useSelector, useDispatch, useStore } from 'react-redux'
import { PlusOutlined } from '@ant-design/icons'
import { DirtyViceTracker } from './DirtyViceTracker'
import { Typography, List, Row, Col, Input, Button, Select, TreeSelect } from 'antd';

const { TextArea } = Input
const { Option } = Select
const { TreeNode } = TreeSelect
const { Title, Text, Paragraph } = Typography;
const gutter = [24, 24]
const colSpan = 18

const WrittenResponse = ({ text, vice, fieldName, minRows = 6 }) => {
  const dispatch = useDispatch()
  const onTextChange = e => {
    dispatch(updateVice({ viceId: vice.id, changedFields: { [fieldName]: e.target.value } }))
  }
  return (
    <Row gutter={gutter}>
      <Col span={colSpan}>
        <div>
          <Text strong={true}>{text}</Text>
          <TextArea autoSize={{ minRows }} value={vice[fieldName]} onChange={onTextChange} />
        </div>
      </Col>
    </Row>
  )
}

const RestrictionEditor = ({ vice }) => {
  const dispatch = useDispatch()
  const state = useStore().getState()
  const savedViceRestrictions = selectViceRestrictions(state)
  const currentSpec = vice.defaultEngagementRestriction.kind === 'CUSTOM' ?
    vice.defaultEngagementRestriction.spec
    : savedViceRestrictions[vice.defaultEngagementRestriction.kind].spec

  const onRestrictionKindSelectionChange = newKind => {
    const defaultCustomStartingSpec = [
      {
        restriction: "Allowed after 5pm",
        appliesOn: [1, 2, 3, 4, 5],
        notes: ""
      }
    ]
    const spec = newKind === 'CUSTOM' ? defaultCustomStartingSpec : null
    dispatch(updateVice(
      {
        viceId: vice.id,
        changedFields: { defaultEngagementRestriction: { kind: newKind, spec } }
      }))
  }

  const groupAppliesOnOptions = {
    EVERYDAY: [0, 1, 2, 3, 4, 5, 6],
    WEEKDAYS: [1, 2, 3, 4, 5],
    WEEKENDS: [0, 6]
  }
  function convertAppliesOnForTreeSelect(dateIndices) {
    if (dateIndices.length === 0) {
      return []
    }
    const currentSelectionStr = JSON.stringify(dateIndices)

    const foundEntry = Object.entries(groupAppliesOnOptions)
      .find(([key, dayInds]) => currentSelectionStr === JSON.stringify(dayInds))
    if (foundEntry) {
      return [ foundEntry[0] ]
    } else {
      return dateIndices.map(i => i.toString())
    }
  }
  function onAppliesOnChange(specComponent) {
    return val => {
      let newAppliesOn = [].concat.apply([], val.map(sel => {
        if (groupAppliesOnOptions[sel]) {
          return groupAppliesOnOptions[sel]
        } else {
          return [Number.parseInt(sel)]
        }
      })).sort()

      let seen = new Set()
      newAppliesOn = newAppliesOn.filter(item => {
        return seen.has(item) ? false : seen.add(item);
      });
// TODO, check if there's actually a diff and/or handle selection of more-restricitve options smarter (or just kill the fancy group selection options)
      const componentIndex = currentSpec.findIndex(comp => comp === specComponent)
      const newComponent = {
        ...specComponent
      }
      
      newComponent.appliesOn = newAppliesOn
      const newSpec = [...currentSpec]
      newSpec.splice(componentIndex, 1, newComponent)
      const kind = vice.defaultEngagementRestriction.kind
      dispatch(updateVice(
        {
          viceId: vice.id,
          changedFields: { defaultEngagementRestriction: { kind, spec: newSpec } }
        }))

    }
  }
  return (
    <Col flex='auto'>
      <Row>
        <Select defaultValue={vice.defaultEngagementRestriction.kind} onChange={onRestrictionKindSelectionChange}>
          {Object.entries(savedViceRestrictions).map(([key, restriction]) =>
            <Option value={key}>{restriction.displayName}</Option>)}
          <Option value="CUSTOM">Custom</Option>
        </Select>
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
          {currentSpec.map(specComponent =>
            <Row>
              <Col flex={1}>
                <TreeSelect
                  showSearch
                  style={{ width: '100%' }}
                  value={convertAppliesOnForTreeSelect(specComponent.appliesOn)}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  placeholder="Applies to"
                  allowClear
                  multiple
                  treeDefaultExpandAll
                  onChange={onAppliesOnChange(specComponent)}
                >
                  <TreeNode value="EVERYDAY" title="Everyday">
                    <TreeNode value="WEEKDAYS" title="Weekdays">
                      <TreeNode value="1" title="Monday" />
                      <TreeNode value="2" title="Tuesday" />
                      <TreeNode value="3" title="Wednesday" />
                      <TreeNode value="4" title="Thursday" />
                      <TreeNode value="5" title="Friday" />
                    </TreeNode>
                    <TreeNode value="WEEKENDS" title="Weekends">
                      <TreeNode value="0" title="Sunday" />
                      <TreeNode value="6" title="Saturday" />
                    </TreeNode>
                  </TreeNode>
                </TreeSelect>
              </Col>
              <Col flex={1}>
                <div>
                  {specComponent.restriction}
                </div>
              </Col>
              <Col flex={1}>
                <div>
                  {specComponent.notes}
                </div>
              </Col>
            </Row>
          )}
        </Col>
      </Row>
    </Col>
  )
}

export const ViceEditor = ({ match }) => {
  const { viceId } = match.params
  const vice = useSelector(state => selectViceById(state, viceId))
  const dispatch = useDispatch()

  const onAddTacticClick = e => {
    const newId = vice.mitigationTactics.length > 0 ?
      (Math.max.apply(null, vice.mitigationTactics.map(mt => mt.id)) + 1)
      : 0
    const newTactics = vice.mitigationTactics.concat({ id: newId, text: "" })
    dispatch(updateVice({ viceId, changedFields: { mitigationTactics: newTactics } }))
  }
  function onTacticTextChange(targetId) {
    return str => {
      const newTactics = vice.mitigationTactics.map(tactic => {
        if (tactic.id === targetId) {
          return { id: tactic.id, text: str }
        } else {
          return tactic
        }
      })
      dispatch(updateVice({ viceId, changedFields: { mitigationTactics: newTactics } }))
    }
  }

  if (!vice) {
    return (
      <div>Unknown vice</div>
    )
  }
  return (
    <div style={{ margin: 16 }}>
      <Row >
        <Title level={2}>{vice.name}</Title>
        <DirtyViceTracker viceId={viceId} />
      </Row>
      <Row gutter={gutter}>
        <Col>
          <Text strong={true}>Reference Tag</Text>
        </Col>
        <Col>
          <Text code={true}>#{vice.refTag}</Text>
        </Col>
      </Row>
      <Row gutter={gutter}>
        <Col span={4}>
          <Text strong={true}>Default restrictions</Text>
        </Col>
        <Col span={12}>
          <RestrictionEditor vice={vice} />
        </Col>
      </Row>
      <WrittenResponse
        text="Description"
        vice={vice}
        fieldName="description"
        minRows={3} />
      <WrittenResponse
        text="Describe how this behavior negatively impacts your life"
        vice={vice}
        fieldName="negativeImpactDescription" />
      <WrittenResponse
        text="Describe how you fall into this behavior -- what leads up to you engaging in this?"
        vice={vice}
        fieldName="seductionDescription" />
      <Row gutter={gutter}>
        <Col span={colSpan}>
          <Text strong={true}>What are some tactics you can take to make it more difficult to engage in this behavior or to divert yourself when you feel a strong urge?</Text>
          <List dataSource={vice.mitigationTactics}
            itemLayout="vertical"
            bordered
            split={true}
            style={{ backgroundColor: '#fff' }}
            renderItem={tactic =>
              <List.Item key={tactic.id}>
                <Text editable={{ onChange: onTacticTextChange(tactic.id) }}>{tactic.text}</Text>
              </List.Item>
            } >
            <List.Item>
              <Button block size="large" type="dashed" onClick={onAddTacticClick}><PlusOutlined />Add Tactic</Button>
            </List.Item>
          </List>
        </Col>
      </Row>
    </div>
  )
}