import React from 'react'
import { useSelector } from 'react-redux'
import { selectAllVices } from '../model/tagEntitySlice'
import { Typography, Row, Col, DatePicker, Select } from 'antd';
import { WrittenResponse, gutter, colSpan } from './ViceVirtueSharedStuff'
import moment from 'moment';
const { Text } = Typography;
const { Option } = Select

export const ViceLogEntry = ({ entry, isReadOnlyMode, onChange }) => {
  const allVices = useSelector(state => selectAllVices(state))

  if (!entry) {
    return (<div>Could not find log entry</div>)
  }
  const dateAsMoment = entry.date ? moment(entry.date, "YYYYMMDD") : null
  const onFieldChange = ({ fieldName, value }) => {
    onChange({ [fieldName]: value })
  }
  const onDateChange = val => {
    const newDate = Number.parseInt(val.format("YYYYMMDD"))
    onFieldChange({ fieldName: 'date', value: newDate })
  }
  const onVicesChange = val => {
    // Don't allow the removal of *all* associated vices.
    // TODO: this is kind of a crappy way of addressing the disappearing log problem
    // from the vice editor page, can do this better
    if (val.length === 0) {
      return
    }
    onFieldChange({ fieldName: 'vices', value: val })
  }
  return (
    <div style={{ margin: 16 }}>
      {!isReadOnlyMode &&
        <div>
          <Row gutter={gutter}>
            <Col>
              <Text strong={true}>Date</Text>
            </Col>
            <Col>
              <DatePicker value={dateAsMoment} onChange={onDateChange} />
            </Col>
          </Row>
        </div>}
      <Row gutter={gutter}>
        <Col span={4}>
          <Text strong={true}>Vice(s)</Text>
        </Col>
        <Col span={12}>
          <Select
            mode="tags"
            disabled={isReadOnlyMode}
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
        isReadonly={isReadOnlyMode}
        fieldName="failureAnalysis"
        minRows={3}
        onValueChange={onFieldChange}
      />
      <WrittenResponse
        text="What was the negative impact this had on your life and/or your potential?"
        entity={entry}
        isReadonly={isReadOnlyMode}
        fieldName="impactAnalysis"
        minRows={3}
        onValueChange={onFieldChange}
      />
      <WrittenResponse
        text="What could you have done differently? How would things have turned out?"
        entity={entry}
        isReadonly={isReadOnlyMode}
        fieldName="counterfactualAnalysis"
        minRows={3}
        onValueChange={onFieldChange}
      />
      <WrittenResponse
        text="How can you turn this slip-up into something positive? Consider ways that you can use this as motivation to commit to a prolonged fast from the associated vice or some other beneficial behavior."
        entity={entry}
        isReadonly={isReadOnlyMode}
        fieldName="attonement"
        minRows={3}
        onValueChange={onFieldChange}
      />
    </div>)
}