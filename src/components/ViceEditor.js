import React from 'react'
import { selectViceById, updateVice } from '../model/viceSlice'
import { useSelector, useDispatch } from 'react-redux'
import { PlusOutlined } from '@ant-design/icons';
import { Typography, List, Row, Col, Input, Button } from 'antd';

const { TextArea } = Input
const { Title, Text, Paragraph } = Typography;
const gutter = [24, 24]
const colSpan = 16
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

export const ViceEditor = ({ match }) => {
  const { viceId } = match.params
  const vice = useSelector(state => selectViceById(state, viceId))
  const dispatch = useDispatch()

  const onAddTacticClick = e => {
    const newId = vice.mitigationTactics.length > 0 ?
      Math.max.apply(null, Object.keys(vice.mitigationTactics)) + 1
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
    <div style={{margin:16}}>
      <Row >
        <Title level={2}>{vice.name}</Title>
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
        <Col>
          <Text>{vice.defaultEngagementRestriction}</Text>
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
                <Text editable={{onChange:onTacticTextChange(tactic.id)}}>{tactic.text}</Text>
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