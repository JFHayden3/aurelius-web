import React, { useState } from 'react'
import { computeNextViceId, selectViceIds, createNewVice } from '../model/viceSlice'
import { ViceCard } from './ViceCard'
import { useSelector, useDispatch, useStore } from 'react-redux'
import { PlusOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom'
import { AddNewModal } from "./ViceVirtueSharedStuff"

import { Affix, Button, Tooltip, Modal, Form, Input, Typography } from 'antd';

const { Text } = Typography

export const ViceBank = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false)

  const vices = useSelector(state => selectViceIds(state))
  const dispatch = useDispatch()
  const history = useHistory()
  const store = useStore()

  const onAddNewClick = () => {
    setCreateModalVisible(true)
  }
  const onAddNewCancel = () => {
    setCreateModalVisible(false)
  }
  const onAddNewConfirm = ({ name, tag }) => {
    const newViceId = computeNextViceId(store.getState())
    dispatch(createNewVice({ id: newViceId, name: name, tag: tag }))
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
      <AddNewModal
        visible={createModalVisible}
        onOk={onAddNewConfirm}
        onCancel={onAddNewCancel}
      />
    </div>)
}
