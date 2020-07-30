import React, { Component, useState } from 'react'
import { computeNextViceId, selectViceIds, createNewVice } from '../model/viceSlice'
import { ViceCard } from './ViceCard'
import { useSelector, useDispatch, useStore } from 'react-redux'
import { PlusOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom'


import { Affix, Button, Tooltip, Modal, Form, Input, Typography } from 'antd';
const { Text } = Typography
//<Link to={`/vices/createNew`} >
//              <PlusOutlined />
//            </Link>

export const ViceBank = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [newViceName, setNewViceName] = useState("")
  const [newViceTag, setNewViceTag] = useState("")

  const vices = useSelector(state => selectViceIds(state))
  const dispatch = useDispatch()
  const history = useHistory()
  const store = useStore()

  function changeNewViceName(str) {
    const reg = /^[a-z0-9\s]*$/i;
    if (reg.test(str) && str.length <= 20) {
      // Replace multiple spaces in a row
      let cleanedStr = str.replace(/\s+/g, ' ')
      setNewViceName(cleanedStr)
      setNewViceTag(cleanedStr.toLowerCase().replace(/\s/g, '-'))
    }
    // TODO: uniqueness and min length check
  }
  const onViceNameFormChange = e => {
    changeNewViceName(e.target.value)
  }
  const onAddNewClick = e => {
    changeNewViceName("")
    setCreateModalVisible(true)
  }
  const onAddNewCancel = e => {
    changeNewViceName("")
    setCreateModalVisible(false)
  }
  const onAddNewConfirm = e => {
    const newViceId = computeNextViceId(store.getState())
    dispatch(createNewVice({ id: newViceId, name: newViceName, tag: newViceTag }))
    setCreateModalVisible(false)
    history.push(`/vices/edit/${newViceId}`)
  }
  return (
    <div style={{ margin: 16 }}>
      <div style={{ gridTemplateColumns: 'repeat(auto-fill, 250px)', display: 'grid' }}>
        {vices.map(viceId =>
          <div key={viceId} style={{ margin: '4px' }}>
            <ViceCard viceId={viceId} />
          </div>
        )}
      </div>
      <Affix style={{ position: 'absolute', top: '80%', left: '80%' }}>
        <Tooltip title="Add new">
          <Button type='primary' shape='circle' size='large' onClick={onAddNewClick}>
            <PlusOutlined />
          </Button>
        </Tooltip>
      </Affix>
      <Modal
        title="New Vice"
        visible={createModalVisible}
        onOk={onAddNewConfirm}
        onCancel={onAddNewCancel}
      >
        <span><Text strong={true}>Name: </Text><Input maxLength={20} value={newViceName} onChange={onViceNameFormChange} /></span>
        <span><Text strong={true}>Tag: </Text><Text code={true}>#{newViceTag}</Text></span>
      </Modal>
    </div>)
}
