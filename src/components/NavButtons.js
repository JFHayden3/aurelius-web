import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  useLocation,
  useHistory,
} from 'react-router-dom'
import { Menu, Divider } from 'antd'
import { SexyButton } from './SexyButton'
import { selectByTagEntityKind, selectAllVices, computeNextTagEntityId, createNewTagEntity } from '../model/tagEntitySlice'
import { AddNewModal } from "./ViceVirtueSharedStuff"

import {
  FileTextOutlined,
  FallOutlined,
  RiseOutlined,
  SettingOutlined,
  TrophyOutlined
} from '@ant-design/icons';


const navButtonProperties = {
  JOURNAL: {
    icon: <FileTextOutlined />
    , text: 'Journal'
    , color: '#bae7ff'
    , loc: 'journal'
  },
  VICE: {
    icon: < FallOutlined />
    , text: 'Vices'
    , color: '#ffccc7'
    , loc: 'vices'
  },
  VIRTUE: {
    icon: <RiseOutlined />
    , text: 'Virtues'
    , color: '#d9f7be'
    , loc: 'virtues'
  },
  CHALLENGE: {
    icon: <TrophyOutlined />
    , text: 'Challenges'
    , color: '#ffffb8'
    , loc: 'challenges'
  },
  SETTINGS: {
    icon: <SettingOutlined />
    , text: 'Settings'
    , color: '#f5f5f5'
    , loc: 'settings'
  },
}

const NavButton = ({ type, menu }) => {
  const history = useHistory()
  const location = useLocation()
  const buttProps = navButtonProperties[type]
  return (
    <SexyButton
      icon={buttProps.icon}
      text={buttProps.text}
      color={buttProps.color}
      popupMenu={menu}
      isSelected={location.pathname.includes(buttProps.loc)}
      onClick={e => history.push(`/` + buttProps.loc)} />
  )
}

export const JournalButton = () => {
  return (
    <NavButton type='JOURNAL' />
  )
}

const TagEntityButton = ({ type }) => {
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const history = useHistory()
  const dispatch = useDispatch()
  const tagEntities = useSelector(state => selectByTagEntityKind(state, type)).sort((a, b) => a.name.localeCompare(b.name))
  const nextTeId = useSelector(state => computeNextTagEntityId(state))
  const loc = navButtonProperties[type].loc
  const onEntityClick = id => e => {
    e.domEvent.stopPropagation()
    history.push('/' + loc + '/edit/' + id)
  }
  const onAddNewClick = e => {
    e.domEvent.stopPropagation()
    setCreateModalVisible(true)
  }
  const onAddNewCancel = () => {
    setCreateModalVisible(false)
  }
  const onAddNewConfirm = ({ name, tag }) => {
    dispatch(createNewTagEntity({ id: nextTeId, name: name, refTag: tag, kind: type }))
      .then(res => {
        setCreateModalVisible(false)
        history.push('/' + loc + '/edit/' + nextTeId)
      })
  }
  const menu = (
    <Menu>
      <Menu.Item key='addNew' onClick={onAddNewClick}>
        <span style={{ fontStyle: 'italic', fontWeight: 'bold' }}>+ Add New</span>
        <Divider style={{ marginTop: '8px', marginBottom: '2px' }} />
      </Menu.Item>
      {tagEntities.map(entity =>
        <Menu.Item key={entity.refTag} onClick={onEntityClick(entity.id)}>
          <span style={{}}>{entity.name}</span>
        </Menu.Item>
      )}
    </Menu>
  )
  return (
    <div>
      <NavButton type={type} menu={menu} />
      <AddNewModal
        visible={createModalVisible}
        onOk={onAddNewConfirm}
        onCancel={onAddNewCancel}
      />
    </div>
  )
}

export const VicesButton = () => {
  return (
    <TagEntityButton type='VICE' />
  )
}

export const VirtuesButton = () => {
  return (
    <TagEntityButton type='VIRTUE' />
  )
}

export const ChallengesButton = () => {
  return (
    <TagEntityButton type='CHALLENGE' />
  )
}

export const SettingsButton = () => {
  return (
    <NavButton type='SETTINGS' />
  )
}

