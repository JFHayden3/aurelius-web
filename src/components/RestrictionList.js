

import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  selectArticleById,
  updateAgendaRestriction,
  removeAgendaRestriction,
  addAgendaRestriction,
  selectRestrictionById,
  moveAgendaRestriction
} from '../model/journalArticlesSlice'
import { RestrictionModal } from './RestrictionModal'
import { ConditionEditor } from './ConditionEditor'
import { MenuOutlined, PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { Space, Typography, Tooltip, Button } from 'antd'
import { useDrop, useDrag } from 'react-dnd'

const { Text } = Typography

const ReadonlyRestrictionItem = ({ articleId, restrictionId, onEditClick }) => {
  const [hovered, setHovered] = useState(false)
  const restrictionItem = useSelector((state) => selectRestrictionById(state, articleId, restrictionId))
  const [{ isDragging }, drag] = useDrag({
    item: { type: 'restriction', restriction: restrictionItem },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  })
  const dispatch = useDispatch()
  const onDeleteClick = e => {
    dispatch(removeAgendaRestriction({ articleId, removeId: restrictionId }))
  }
  const { activities, optNote, restriction } = restrictionItem
  // TODO: better representation of activities. We know that they're all vice ref tags
  const activityStr = activities.join(', ')
  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Space direction='horizontal' size='small' align='start'>
        <MenuOutlined style={{ cursor: 'grab', paddingTop: '6px' }} />
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
                  <Space direction='horizontal' size='small' style={{ width: "100%" }}>
                    <ConditionEditor isReadOnly={true} value={restriction} onChange={(e) => { }} />
                    <Text>- {activityStr}</Text>
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
    </div>
  )
}


const RestrictionItemSpace = ({ index, moveRestriction, children }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'restriction',
    drop: (item) => moveRestriction(item.restriction, index),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  })
  return (
    <div ref={drop}
      style={{
        borderTopWidth: "2px",
        borderTopStyle: isOver ? 'solid' : 'none',
      }}>
      {children}
    </div>
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
  function moveRestriction(restriction, index) {
    dispatch(moveAgendaRestriction({ articleId, restrictionIdToMove: restriction.id, toIndex: index }))
  }
  return (
    <div>
      {restrictions && restrictions.map((restriction, index) => (
        <div key={restriction.id}>
          <RestrictionItemSpace index={index} moveRestriction={moveRestriction}>
            <ReadonlyRestrictionItem
              articleId={articleId}
              restrictionId={restriction.id}
              onEditClick={onEditRestrictionClick(restriction)} />
          </RestrictionItemSpace>
        </div>
      ))}
      <RestrictionItemSpace index={restrictions.length} moveRestriction={moveRestriction}>
        <Button onClick={onAddRestrictionClick} type="dashed" style={{ margin: '5px' }}>
          <PlusOutlined /> Add Restriction
        </Button>
      </RestrictionItemSpace>
      {modalRestriction &&
        <RestrictionModal agendaRestriction={modalRestriction}
          isVisible={modalVisible}
          onConfirm={onModalOk}
          onCancel={onModalCancel} />}
    </div>

  )
}