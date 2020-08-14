import React, { Component, useState } from 'react'
import { computeNextVirtueId, selectVirtueIds, createNewVirtue } from '../model/virtueSlice'
import { VirtueCard } from './VirtueCard'
import { useSelector, useDispatch, useStore } from 'react-redux'
import { PlusOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom'
import { AddNewModal } from "./ViceVirtueSharedStuff"
import { Affix, Button, Tooltip, Modal, Form, Input, Typography } from 'antd';

const { Text } = Typography

export const VirtueBank = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false)
  
  const store = useStore()

  console.log(store.getState())

  const virtues = useSelector(state => selectVirtueIds(state))
  const dispatch = useDispatch()
  const history = useHistory()
  
  const onAddNewClick = () => {
    setCreateModalVisible(true)
  }
  const onAddNewCancel = () => {
    setCreateModalVisible(false)
  }
  const onAddNewConfirm = ({name, tag}) => {
    const newVirtueId = computeNextVirtueId(store.getState())
    dispatch(createNewVirtue({ id: newVirtueId, name: name, tag: tag }))
    setCreateModalVisible(false)
    history.push(`/virtues/edit/${newVirtueId}`)
  }
  return (
    <div style={{ margin: 16 }}>
      <div style={{ gridTemplateColumns: 'repeat(auto-fill, 250px)', display: 'grid' }}>
        {virtues.map(virtueId =>
          <div key={virtueId} style={{ margin: '4px' }}>
            <VirtueCard virtueId={virtueId} />
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
      <AddNewModal
        visible={createModalVisible}
        onOk={onAddNewConfirm}
        onCancel={onAddNewCancel}
      />
    </div>)
}
