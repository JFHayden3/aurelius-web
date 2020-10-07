
import React, { useState } from 'react'
import { Typography, Row, Col, Input, Modal, Space, List } from 'antd';

const { TextArea } = Input
const { Text } = Typography;

export const gutter = [24, 24]
export const colSpan = 18

export const TextItemList = ({ values, nextId, onAddItem, onRemoveItem, onChangeItem, placeholder = 'Add item' }) => {
  const items = values.map(v => { return { id: v.id, text: v.text, placeholder: "" } })
  items.push({ id: nextId, text: "", placeholder: placeholder })
  const onFocus = item => e => {
    if (item.id === nextId) {
      onAddItem()
    }
  }
  const onBlur = item => e => {
    if (item.text.trim() === "") {
      onRemoveItem(item.id)
    }
  }
  return (
    <List dataSource={items}
      itemLayout="vertical"
      bordered
      split={true}
      style={{ backgroundColor: '#fff', borderRadius:'20px' }}
      renderItem={item =>
        <List.Item key={item.id} style={{padding:'8px'}}>
          <Input
            style={{ padding: 0, borderStyle: 'none' }}
            allowClear
            value={item.text}
            onFocus={onFocus(item)}
            onBlur={onBlur(item)}
            placeholder={item.placeholder}
            onChange={e => onChangeItem(item.id, e.target.value)} />
        </List.Item>
      } >
    </List>
  )
}

export const WrittenResponse = ({ text, entity, fieldName, minRows = 6, isReadonly = false, onValueChange }) => {
  const onTextChange = e => {
    onValueChange({ fieldName, value: e.target.value })
  }
  return (
    <Row gutter={gutter}>
      <Col span={colSpan}>
        <Space direction='vertical' style={{ width: '100%' }}>
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