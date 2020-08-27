
import React, { useState } from 'react'
import { Typography, Row, Col, Input, Modal, Space } from 'antd';

const { TextArea } = Input
const { Text } = Typography;

export const gutter = [24, 24]
export const colSpan = 18

export const WrittenResponse = ({ text, entity, fieldName, minRows = 6, isReadonly = false, onValueChange }) => {
  const onTextChange = e => {
    onValueChange({ fieldName, value: e.target.value })
  }
  return (
    <Row gutter={gutter}>
      <Col span={colSpan}>
        <Space direction='vertical' style={{width:'100%'}}>
          <Text strong={true}>{text}</Text>
          {isReadonly && <Text>{entity[fieldName]}</Text>}
          {!isReadonly && <TextArea autoSize={{ minRows }} value={entity[fieldName]} onChange={onTextChange} />}
        </Space>
      </Col>
    </Row>
  )
}

export const AddNewModal = ({ visible, onOk, onCancel }) => {
  const [newName, setNewName] = useState("")
  const [newTag, setNewTag] = useState("")
  function changeNewName(str) {
    const reg = /^[a-z0-9\s]*$/i;
    if (reg.test(str) && str.length <= 20) {
      // Replace multiple spaces in a row
      let cleanedStr = str.replace(/\s+/g, ' ')
      setNewName(cleanedStr)
      setNewTag(cleanedStr.toLowerCase().replace(/\s/g, '-'))
    }
    // TODO: uniqueness and min length check
  }
  const onNameFormChange = e => {
    changeNewName(e.target.value)
  }
  const onAddNewConfirm = e => {
    e.preventDefault()
    onOk({ name: newName, tag: newTag })
  }
  const onCancelClick = e => {
    e.preventDefault()
    changeNewName("")
    onCancel()
  }

  return (
    <Modal 
      visible={visible}
      onOk={onAddNewConfirm}
      onCancel={onCancelClick}
    >
      <span><Text strong={true}>Name: </Text><Input maxLength={20} value={newName} onChange={onNameFormChange} /></span>
      <span><Text strong={true}>Tag: </Text><Text code={true}>#{newTag}</Text></span>
    </Modal>
  )
}