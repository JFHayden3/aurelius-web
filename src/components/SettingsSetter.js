import React, { useState } from 'react'
import {
  selectTargetDailyWordCount,
  selectAllArticleSettings,
  selectArticleSettingByArticleKind,
  updateTargetDailyWordCount,
  updateArticleSetting,
  saveSettings,
  removeUserCreatedArticleSettings,
} from '../model/settingsSlice'
import { useSelector, useDispatch } from 'react-redux'
import {
  Typography,
  List, Row, Col, Button, InputNumber, Select, Divider, Modal, Input
} from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { journalPromptFrequencies } from '../kitchenSink'
import { CreateNewPromptModal } from './CreateNewPromptModal'

const { Title, Text } = Typography;
const { Option } = Select

const ArticleSettingsSetter = ({ articleKind }) => {
  const hasFixedFrequency = articleKind === 'VICE_LOG'
  const dispatch = useDispatch()
  const artSettings = useSelector(state => selectArticleSettingByArticleKind(state, articleKind))
  function changeFields(updates) {
    dispatch(updateArticleSetting({ articleKind, updates }))
    dispatch(saveSettings())
  }
  function onOrderingChange(value) {
    changeFields({ ordering: value })
  }
  function onFrequencyChange(newFreq) {
    let details = null
    if (newFreq === 'RANDOMLY') {
      details = 30
    } else if (newFreq === 'SPECIFIC_DOW') {
      details = [1, 3, 5]
    }
    changeFields({ promptFrequency: { kind: newFreq, details } })
  }
  function onSelectDaysChange(newDays) {
    changeFields({ promptFrequency: { kind: artSettings.promptFrequency.kind, details: newDays } })
  }
  function onPercentChanceChange(newVal) {
    changeFields({ promptFrequency: { kind: artSettings.promptFrequency.kind, details: newVal } })
  }
  function onDeleteClick(e) {
    e.preventDefault()
    dispatch(removeUserCreatedArticleSettings({ articleKey: articleKind }))
    dispatch(saveSettings())
  }
  return (
    <div>
      <Row>
        <Col>
          <Title level={4} editable={artSettings.isUserCreated}>{artSettings.title} </Title>
        </Col>
        <Col>
          {artSettings.isUserCreated &&
            <Button onClick={onDeleteClick} type="text" style={{ float: "right" }}>
              <DeleteOutlined />
            </Button>}
        </Col>
      </Row>
      <Row>
        <Col span={4}>
          <Text strong={true}>Prompt</Text>
        </Col>
        <Col span={20}>
          <Text style={{ fontStyle: 'italic' }} editable={artSettings.isUserCreated}>"{artSettings.hintText}"</Text>
        </Col>
      </Row>
      <Row>
        <Col span={4}>
          <Text strong={true}>Frequency</Text>
        </Col>
        <Col flex="auto">
          <Select
            onChange={onFrequencyChange}
            disabled={hasFixedFrequency}
            optionLabelProp="title"
            style={{ minWidth: 130 }}
            value={journalPromptFrequencies[artSettings.promptFrequency.kind]}>
            {Object.entries(journalPromptFrequencies).map(([key, value]) =>
              <Option key={key} label={value}>{value}</Option>)}
          </Select>
          {artSettings.promptFrequency.kind === 'SPECIFIC_DOW'
            &&
            <Select mode='multiple' placeholder='Select days'
              style={{ minWidth: 200 }}

              value={artSettings.promptFrequency.details}
              onChange={onSelectDaysChange}>
              <Option value={1}>Monday</Option>
              <Option value={2}>Tuesday</Option>
              <Option value={3}>Wednesday</Option>
              <Option value={4}>Thursday</Option>
              <Option value={5}>Friday</Option>
              <Option value={0}>Sunday</Option>
              <Option value={6}>Saturday</Option>
            </Select>}
          {artSettings.promptFrequency.kind === 'RANDOMLY'
            &&
            <InputNumber
              defaultValue={artSettings.promptFrequency.details}
              min={0}
              max={100}
              formatter={value => `${value}%`}
              parser={value => value.replace('%', '')}
              onChange={onPercentChanceChange}
            />}
        </Col>
      </Row>
      <Row>
        <Col span={4}>
          <Text strong={true}>Ordering</Text>
        </Col>
        <Col flex="auto">
          <InputNumber min={1} max={100} value={artSettings.ordering} onChange={onOrderingChange} />
        </Col>
      </Row>
    </div>
  )
}

export const SettingsSetter = () => {
  const targetDailyWordCount = useSelector(selectTargetDailyWordCount)
  const allArticleSettings = Object.entries(useSelector(selectAllArticleSettings))
    .sort(([akey, aSettings], [bkey, bSettings]) => aSettings.ordering - bSettings.ordering)
    .map(([key, setting]) => key)
  const dispatch = useDispatch()
  const minAllowedWordCount = 50
  const maxAllowedWordCount = 5000
  const [newPromptModalVisible, setNewPromptModalVisible] = useState(false)
  function onTargetWordCountChange(value) {
    if (value < maxAllowedWordCount && value >= minAllowedWordCount) {
      dispatch(updateTargetDailyWordCount({ newWordCount: value }))
      dispatch(saveSettings())
    }
  }
  function onAddNewPromptClick(e) {
    e.preventDefault()
    setNewPromptModalVisible(true)
  }
  function hideNewPromptModal() {
    setNewPromptModalVisible(false)
  }
  return (
    <div>
      <Title level={2}>Settings</Title>
      <Row>
        <Col span={3}>
          <Text strong={true}>Daily word count goal</Text>
        </Col>
        <Col span={3}>
          {targetDailyWordCount && <InputNumber min={minAllowedWordCount} max={maxAllowedWordCount} defaultValue={targetDailyWordCount} onChange={onTargetWordCountChange}>{targetDailyWordCount}</InputNumber>}
        </Col>
      </Row>
      <Divider></Divider>
      <Row>
        <Col span={3}>
          <Text strong={true}>Journal Prompts</Text>
        </Col>
        <Col span={18}>
          <Button type='primary' onClick={onAddNewPromptClick}>Create New</Button>
          <List
            style={{
              backgroundColor: 'white',
              maxHeight: 400,
              paddingLeft: 8,
              paddingRight: 8,
              overflowY: 'scroll'
            }}
            dataSource={allArticleSettings}
            itemLayout="vertical"
            renderItem={(key) =>
              <List.Item key={key}>
                <ArticleSettingsSetter articleKind={key} />
              </List.Item>
            } />
        </Col>
      </Row>
      <CreateNewPromptModal isVisible={newPromptModalVisible} onClose={hideNewPromptModal} onConfirm={hideNewPromptModal} />
    </div>
  )
}