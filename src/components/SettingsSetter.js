import React from 'react'
import {
  selectTargetDailyWordCount,
  selectAllArticleSettings,
  selectArticleSettingByArticleKind,
  updateTargetDailyWordCount,
  updateArticleSetting,
  saveSettings
} from '../model/settingsSlice'
import { useSelector, useDispatch } from 'react-redux'
import { Typography, List, Row, Col, Button, InputNumber, Select, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons'
import { journalPromptFrequencies } from '../kitchenSink'

const { Title, Text } = Typography;
const { Option } = Select

const ArticleSettingsSetter = ({ articleKind }) => {
  const dispatch = useDispatch()
  const artSettings = useSelector(state => selectArticleSettingByArticleKind(state, articleKind))
  function onOrderingChange(value) {
    dispatch(updateArticleSetting({ articleKind, updates: { ordering: value } }))
    dispatch(saveSettings())
  }
  function onFrequencyChange(newFreq) {

  }
  return (
    <div>
      <Row>
        <Col >
          <Text strong={true}>Title</Text>
        </Col>
        <Col>
          <Text editable={artSettings.isUserCreated}>{artSettings.title} </Text>
        </Col>
      </Row>
      <Row>
        <Col span={2}>
          <Text strong={true}>Prompt</Text>
        </Col>
        <Col flex="auto">
          <Text editable={artSettings.isUserCreated}>{artSettings.hintText} </Text>
        </Col>
      </Row>
      <Row>
        <Col span={2}>
          <Text strong={true}>Frequency</Text>
        </Col>
        <Col flex="auto">
          <Select
            onChange={onFrequencyChange}
            optionLabelProp="title"
            value={journalPromptFrequencies[artSettings.promptFrequency]}>
            {Object.entries(journalPromptFrequencies).map(([key, value]) =>
              <Option key={key} label={value}>{value}</Option>)}
          </Select>
        </Col>
      </Row>
      <Row>
        <Col span={2}>
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
  const allArticleSettings = useSelector(selectAllArticleSettings)
  const dispatch = useDispatch()
  const minAllowedWordCount = 50
  const maxAllowedWordCount = 5000
  function onTargetWordCountChange(value) {
    if (value < maxAllowedWordCount && value >= minAllowedWordCount) {
      dispatch(updateTargetDailyWordCount({ newWordCount: value }))
      dispatch(saveSettings())
    }
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
        <Col span={18} >
          <List
            dataSource={Object.keys(allArticleSettings)}
            itemLayout="vertical"
            renderItem={(key) =>
              <List.Item key={key}>
                <ArticleSettingsSetter articleKind={key} />
              </List.Item>
            } />
        </Col>
      </Row>
    </div>
  )
}