import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectAllChallenges, deleteTagEntityAsync, computeNextTagEntityId, createNewTagEntity } from '../model/tagEntitySlice'
import { List, Space, Typography, Button, Affix, Tooltip } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { apiDateToFe } from '../kitchenSink'
import { AddNewModal } from './ViceVirtueSharedStuff'
import { Link, useHistory } from 'react-router-dom'

const { Title, Text } = Typography

export const ChallengeBank = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false)

  const allChallenges = useSelector((state) => selectAllChallenges(state))
  const dispatch = useDispatch()
  const history = useHistory()
  const newChallengeId = useSelector((state) => computeNextTagEntityId(state))
  function onDeleteClick(id) {
    return e => {
      dispatch(deleteTagEntityAsync({ tagEntityId: id }))
    }
  }
  function onAddNewClick(e) {
    setCreateModalVisible(true)
  }
  const onAddNewCancel = () => {
    setCreateModalVisible(false)
  }
  const onAddNewConfirm = ({ name, tag }) => {
    dispatch(createNewTagEntity({ id: newChallengeId, name: name, refTag: tag, kind: 'CHALLENGE' }))
      .then(res => {
        setCreateModalVisible(false)
        history.push(`/challenges/edit/${newChallengeId}`)
      })
  }
  return (
    <div>
      <List
        dataSource={allChallenges}
        itemLayout="vertical"
        renderItem={challenge =>
          <List.Item>
            <Space>
              <Title level={4}>{challenge.name}</Title>
              <Text>{apiDateToFe(challenge.startDate)} - {apiDateToFe(challenge.endDate)}</Text>
              <div style={{ float: "right" }}>
                <Button type="text">
                  <Link to={`/challenges/edit/${challenge.id}`}><EditOutlined /></Link>
                </Button>
                <Button type="text" onClick={onDeleteClick(challenge.id)}>
                  <DeleteOutlined />
                </Button>
              </div>
            </Space>
          </List.Item>
        }></List>
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
    </div>
  )
}