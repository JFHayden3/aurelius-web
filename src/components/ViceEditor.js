import React, { useState } from 'react'
import { selectViceById, updateEntity } from '../model/tagEntitySlice'
import { selectViceLogsByVice, createNewViceLogEntry, computeNextViceLogId } from '../model/viceLogSlice'
import { useSelector, useDispatch, useStore } from 'react-redux'
import { PlusOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons'
import { RestrictionEditor } from './RestrictionEditor'
import { DirtyViceTracker } from './DirtyViceTracker'
import { Typography, List, Row, Col, Button, Collapse, Space, Modal } from 'antd';
import { WrittenResponse, gutter, colSpan } from './ViceVirtueSharedStuff'
import { ViceLogEntry } from './ViceLogEntry'
import { dateAsYyyyMmDd, apiDateToFe } from '../kitchenSink'
const { Title, Text } = Typography;
const { Panel } = Collapse

export const ViceEditor = ({ match }) => {
  const [editingLogId, setEditingLogId] = useState(null)
  const [expandedLogPanelIds, setExpandedLogPanelIds] = useState([])
  const { viceId } = match.params
  const nextViceLogId = useSelector(state => computeNextViceLogId(state))
  const vice = useSelector(state => selectViceById(state, viceId))
  const dispatch = useDispatch()
  const associatedViceLogs = useSelector(state => selectViceLogsByVice(state, vice ? vice.refTag : ""))
  const onTextFieldChange = ({ fieldName, value }) => {
    dispatch(updateEntity({ tagEntityId: vice.id, changedFields: { [fieldName]: value } }))
  }
  const onRestrictionIdSelectionChange = newRestrictionId => {
    dispatch(updateEntity(
      {
        tagEntityId: vice.id,
        changedFields: { defaultEngagementRestriction: { kind: newRestrictionId } }
      }))
  }

  const onAddTacticClick = e => {
    const newId = vice.mitigationTactics.length > 0 ?
      (Math.max.apply(null, vice.mitigationTactics.map(mt => mt.id)) + 1)
      : 0
    const newTactics = vice.mitigationTactics.concat({ id: newId, text: "" })
    dispatch(updateEntity({ tagEntityId: vice.id, changedFields: { mitigationTactics: newTactics } }))
  }
  const onAddViceLogEntryClick = e => {
    const payload = {
      id: nextViceLogId,
      vices: [vice.refTag],
      date: dateAsYyyyMmDd(new Date(Date.now()))
    }
    dispatch(createNewViceLogEntry(payload))
      .then(res => {
        setEditingLogId(payload.id)
        setExpandedLogPanelIds(expandedLogPanelIds.concat("" + payload.id))
      })
  }
  const onLogPanelExpansionChange = val => {
    if (!val.includes(editingLogId + "")) {
      setEditingLogId(null)
    }
    setExpandedLogPanelIds(val)
  }
  function onEditViceLogEntryClick(logId) {
    return e => {
      e.stopPropagation()
      if (logId !== null && !expandedLogPanelIds.includes("" + logId)) {
        setExpandedLogPanelIds(expandedLogPanelIds.concat("" + logId))
      }
      setEditingLogId(logId)
    }
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
      dispatch(updateEntity({ tagEntityId: viceId, changedFields: { mitigationTactics: newTactics } }))
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
          <RestrictionEditor
            customKeyId={"V" + vice.id}
            currentRestrictionId={vice.defaultEngagementRestriction.kind}
            onRestrictionIdChange={onRestrictionIdSelectionChange}
            allowSaving={true}
          />
        </Col>
      </Row>
      <WrittenResponse
        text="Description"
        entity={vice}
        fieldName="description"
        minRows={3}
        onValueChange={onTextFieldChange}
      />
      <WrittenResponse
        text="Describe how this behavior negatively impacts your life"
        entity={vice}
        fieldName="negativeImpactDescription"
        onValueChange={onTextFieldChange}
      />
      <WrittenResponse
        text="Describe how you fall into this behavior -- what leads up to you engaging in this?"
        entity={vice}
        fieldName="seductionDescription"
        onValueChange={onTextFieldChange}
      />
      <Row gutter={gutter}>
        <Col span={colSpan}>
          <Text strong={true}>What are some steps you can take to make it more difficult to engage in this behavior or to divert yourself when you feel a strong urge?</Text>
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
      <Col span={colSpan}>
        <Space direction='vertical' style={{ width: '100%' }} >
          <Text strong={true}>Log entries</Text>
          <Collapse activeKey={expandedLogPanelIds} onChange={onLogPanelExpansionChange} >
            {associatedViceLogs.map(vl =>
              <Panel key={vl.id}
                header={apiDateToFe(vl.date)}
                extra={(
                  <div>
                    {editingLogId !== vl.id &&
                      <Button size="small" type="text"
                        onClick={onEditViceLogEntryClick(vl.id)}>
                        <EditOutlined />
                      </Button>}
                    {editingLogId === vl.id &&
                      <Button size="small" type="text"
                        onClick={onEditViceLogEntryClick(null)}>
                        <CheckOutlined />
                      </Button>}
                  </div>)}>
                <ViceLogEntry logId={vl.id} isReadOnlyMode={editingLogId !== vl.id} />
              </Panel>
            )}
          </Collapse>
          <Button block size="large" type="dashed" onClick={onAddViceLogEntryClick}><PlusOutlined />Add Entry</Button>
        </Space>
      </Col>
    </div>
  )
}