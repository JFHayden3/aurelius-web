
import React, { useState } from 'react'
import { Typography, Select, Input, Modal, Space } from 'antd';
import { } from '@ant-design/icons';
import { useSelector } from 'react-redux'
import { selectAllVices } from '../model/tagEntitySlice'

const { TextArea } = Input
const { Text } = Typography;
const { Option } = Select

export const RestrictionModal = ({ agendaRestriction, isVisible, onConfirm, onCancel }) => {
  const [restriction, setRestriction] = useState(agendaRestriction.restriction)
  const [activities, setActivities] = useState(agendaRestriction.activities)
  const [note, setNote] = useState(agendaRestriction.optNote)
  const allVices = useSelector(selectAllVices)

  const onActivitySelectionChange = val => {
    setActivities(val)
  };
  const onNoteTextChange = e => {
    setNote(e.target.value)
  }
  const onRestrictionChange = e => {
    setRestriction(e.target.value)
  }

  const onConfirmClick = e => {
    e.preventDefault()
    const optNote = note
    onConfirm(agendaRestriction.id, { activities, restriction, optNote })
  }

  const disableOkButton = activities.length === 0
  return (
    <Modal
      visible={isVisible}
      onOk={onConfirmClick}
      onCancel={onCancel}
      okButtonProps={{ disabled: disableOkButton }}>
      <Space direction='vertical' size='small'>
        <Space direction='horizontal'>
          <Text strong={true}>Activities *</Text>
          <Select
            mode="tags"
            style={{ minWidth: "250px" }}
            onChange={onActivitySelectionChange} value={activities} >
            {allVices.map(vice =>
              <Option key={vice.refTag}>{vice.name}</Option>
            )}
          </Select>
        </Space>
        <Space direction='horizontal' size='small' style={{ width: '100%' }}>
          <Text strong={true}>Restriction</Text>
          <Input onChange={onRestrictionChange} value={restriction} />
        </Space>
        <Space direction='vertical' size='small' style={{ width: '100%' }}>
          <Text strong={true}>Details</Text>
          <TextArea autoSize={{ minRows: 3 }} value={note} onChange={onNoteTextChange} />
        </Space>
      </Space>
    </Modal>
  )
}