import React, { useState } from 'react'
import {
  saveSettings,
  addUserCreatedArticleSettings,
} from '../model/settingsSlice'
import { useDispatch } from 'react-redux'
import {
  Typography,
  Modal, Input
} from 'antd';

const { Text } = Typography;

export const CreateNewPromptModal = ({ isVisible, onConfirm = () => {}, onClose = () => {} }) => {
  const dispatch = useDispatch()
  const [newPromptTitle, setNewPromptTitle] = useState("")
  const [newPromptHint, setNewPromptHint] = useState("")

  const onNewPromptTitleFormChange = e => {
    setNewPromptTitle(e.target.value)
  }
  const onNewPromptHintFormChange = e => {
    setNewPromptHint(e.target.value)
  }
  const onNewPromptConfirm = e => {
    e.preventDefault()
    const payload = {
      title: newPromptTitle,
      hintText: newPromptHint,
      promptFrequency: { kind: 'DAILY', details: null }
    }
    dispatch(addUserCreatedArticleSettings(payload))
    dispatch(saveSettings())
    onConfirm()
  }
  const onNewPromptCancel = e => {
    e.preventDefault()
    onClose()
  }
  return (
    <Modal visible={isVisible}
      onOk={onNewPromptConfirm}
      onCancel={onNewPromptCancel}>
      <span>
        <Text strong={true}>Title: </Text>
        <Input maxLength={30} value={newPromptTitle} onChange={onNewPromptTitleFormChange} />
      </span>
      <span>
        <Text strong={true}>Prompt: </Text>
        <Input maxLength={500} value={newPromptHint} onChange={onNewPromptHintFormChange} />
      </span>
    </Modal>
  )
}