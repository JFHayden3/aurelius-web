

import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectArticleById, updateAgendaRestriction, removeAgendaRestriction, addAgendaRestriction, selectRestrictionById } from '../model/journalArticlesSlice'
import { RestrictionModal } from './RestrictionModal'
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { Space, Typography, Tooltip, Button } from 'antd'

const { Text } = Typography

const ReadonlyRestrictionItem = ({ articleId, restrictionId, onEditClick }) => {
  const [hovered, setHovered] = useState(false)
  const restrictionItem = useSelector((state) => selectRestrictionById(state, articleId, restrictionId))
  const dispatch = useDispatch()
  const onDeleteClick = e => {
    dispatch(removeAgendaRestriction({ articleId, removeId: restrictionId }))
  }
  const { activities, optNote, restriction } = restrictionItem
  // TODO: better representation of activities. We know that they're all vice ref tags
  const activityStr = activities.join(',')
  return (
    <Space direction='horizontal' size='small' align='start'>
      <div
        onMouseEnter={e => setHovered(true)}
        onMouseLeave={e => setHovered(false)}>
        <Space direction='horizontal' align='start'>
          <div onClick={e => onEditClick()}
            style={{
              cursor: 'pointer',
              height: '100%',
              padding: '2px',
              borderRadius: '6px',
              boxShadow: hovered ? '2px 2px 3px gray' : 'unset'
            }}>
            <Space direction='horizontal' size='middle' align='start'>
              <Space direction='vertical' size='small' style={{ width: "100%" }}>
                <Space direction='horizontal' style={{ width: "100%" }}>
                  <Text>{activityStr}</Text>
                  <Text>{restriction}</Text>
                </Space>
                {optNote &&
                  <Text ellipsis={{ rows: 2, expandable: true, symbol: 'more' }} type='secondary' style={{ fontStyle: 'italic' }}>
                    {optNote}
                  </Text>
                }
              </Space>
            </Space>
          </div>
          <Tooltip title="Remove restriction">
            <div onClick={onDeleteClick} style={{ cursor: 'pointer', visibility: hovered ? 'visible' : 'hidden' }}><CloseOutlined /></div>
          </Tooltip>
        </Space>
      </div>
    </Space>
  )
}

export const RestrictionList = ({ articleId }) => {
  const article = useSelector((state) => selectArticleById(state, articleId))
  const dispatch = useDispatch()
  const [modalVisible, setModalVisible] = useState(false)
  const [modalRestriction, setModalRestriction] = useState(null)
  const restrictions = article.content.restrictions || []

  const onModalCancel = e => {
    // We canceled out of the modal on a new task (because that's the only time the activity 
    // content could be empty). Hacky approach, but w/e it's fine
    if (modalRestriction.activities.length === 0) {
      dispatch(removeAgendaRestriction({ articleId, removeId: modalRestriction.id }))
    }
    setModalVisible(false)
    setModalRestriction(null)
  }
  const onModalOk = (restrictionId, fields) => {
    setModalVisible(false)
    setModalRestriction(null)
    dispatch(updateAgendaRestriction({ articleId, restrictionId, changedFields: fields }))
  }
  const onEditRestrictionClick =
    restriction => e => {
      setModalRestriction(restriction)
      setModalVisible(true)
    }
  const onAddRestrictionClick = e => {
    const newId = restrictions.length > 0 ?
      Math.max.apply(restrictions, restrictions.map(r => r.id)) + 1
      : 0
    const newRestriction = {
      id: newId,
      activities: []
    }
    dispatch(addAgendaRestriction({ articleId, addIndex: restrictions.length, newRestriction }))
    setModalRestriction(newRestriction)
    setModalVisible(true)
  }
  return (
    <div>
      {restrictions && restrictions.map((restriction, index) => (
        <div key={restriction.id}>
          <ReadonlyRestrictionItem
            articleId={articleId}
            restrictionId={restriction.id}
            onEditClick={onEditRestrictionClick(restriction)} />
        </div>
      ))}
      <Button onClick={onAddRestrictionClick} type="dashed" style={{ margin: '5px' }}>
        <PlusOutlined /> Add Restriction
      </Button>
      {modalRestriction &&
        <RestrictionModal agendaRestriction={modalRestriction}
          isVisible={modalVisible}
          onConfirm={onModalOk}
          onCancel={onModalCancel} />}
    </div>

  )
}