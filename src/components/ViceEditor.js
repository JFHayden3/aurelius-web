import React from 'react'
import { selectViceById, updateVice } from '../model/viceSlice'
import { useSelector, useDispatch } from 'react-redux'
import { PlusOutlined } from '@ant-design/icons'
import { ViceDefaultRestrictionEditor } from './ViceDefaultRestrictionEditor'
import { DirtyViceTracker } from './DirtyViceTracker'
import { Typography, List, Row, Col, Button } from 'antd';
import { WrittenResponse, gutter, colSpan } from './ViceVirtueSharedStuff'
const { Title, Text } = Typography;

export const ViceEditor = ({ match }) => {
  const { viceId } = match.params
  const vice = useSelector(state => selectViceById(state, viceId))
  const dispatch = useDispatch()
  const onTextFieldChange = ({ fieldName, value }) => {
    dispatch(updateVice({ viceId: vice.id, changedFields: { [fieldName]: value } }))
  }
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
          <ViceDefaultRestrictionEditor vice={vice} />
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