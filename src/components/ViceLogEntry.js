import React from 'react'
import { useSelector, useDispatch, useStore } from 'react-redux'
import { selectViceLogById, updateViceLog, saveViceLog } from '../model/viceLogSlice'
import { selectAllVices } from '../model/viceSlice'
import { Typography, List, Row, Col, Button, DatePicker, Select } from 'antd';
import { WrittenResponse, gutter, colSpan } from './ViceVirtueSharedStuff'

const { Text } = Typography;
const { Option } = Select

export const ViceLogEntry = ({ logId }) => {
  const dispatch = useDispatch()
  const entry = useSelector(state => selectViceLogById(state, logId))
  const allVices = useSelector(state => selectAllVices(state))
  if (!entry) {
    return (<div>Could not find log entry</div>)
  }
  const onDateChange = val => {
    console.log(val)
  }
  const onVicesChange = val => {
    console.log(val)
  }
  const onTextFieldChange = ({ fieldName, value }) => {
   // dispatch(updateViceLog({ virtueId: virtue.id, changedFields: { [fieldName]: value } }))
  }
  return (
    <div style={{ margin: 16 }}>
      <Row >
        <div>TODO dirtiness tracker</div>
      </Row>
      <Row gutter={gutter}>
        <Col>
          <Text strong={true}>Date</Text>
        </Col>
        <Col>
          <DatePicker onChange={onDateChange} />
        </Col>
      </Row>
      <Row gutter={gutter}>
        <Col span={4}>
          <Text strong={true}>Vice(s)</Text>
        </Col>
        <Col span={12}>
          <Select
            mode="tags"
            style={{ minWidth: "250px" }}
            onChange={onVicesChange} defaultValue={entry.vices} >
            {allVices.map(vice =>
              <Option key={vice.refTag}>{vice.name}</Option>
            )}
          </Select>
        </Col>
      </Row>
      <WrittenResponse
        text="Why do you think you gave in? What were the things that led to the slip-up?"
        entity={entry}
        fieldName="failureAnalysis"
        minRows={3}
        onValueChange={onTextFieldChange}
      />
      <WrittenResponse
        text="What was the negative impact this had on your life and/or your potential?"
        entity={entry}
        fieldName="impactAnalysis"
        minRows={3}
        onValueChange={onTextFieldChange}
      />
      <WrittenResponse
        text="What could you have done differently? How would things have turned out?"
        entity={entry}
        fieldName="counterfactualAnalysis"
        minRows={3}
        onValueChange={onTextFieldChange}
      />
      <WrittenResponse
        text="How can you turn this slip-up into something positive? Consider ways that you can use this as motivation to commit to a prolonged fast from the associated vice or some other beneficial behavior."
        entity={entry}
        fieldName="attonement"
        minRows={3}
        onValueChange={onTextFieldChange}
      />
    </div>)
}