import React from 'react'
import {
  Typography, Space, Input, InputNumber, DatePicker, Select, Tooltip
} from 'antd';
import { useSelector } from 'react-redux'
import { dateAsMoment, momentAsDate } from '../kitchenSink'
import { selectAllTagEntitys } from '../model/tagEntitySlice'
import { selectAllArticleSettings } from '../model/settingsSlice'
import moment from 'moment'

const { Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select;

export const ArticleFilterWidget = ({ defaultValue, onChange, isDisabled = false }) => {
  const allArticleSettings = useSelector((state) => selectAllArticleSettings(state))
  const allTagEntities = useSelector((state) => selectAllTagEntitys(state))

  const searchText = (defaultValue ?? {}).searchText
  const minWordCount = (defaultValue ?? {}).minWordCount
  const startDate = (defaultValue ?? {}).startDate
  const endDate = (defaultValue ?? {}).endDate
  const articleTypes = (defaultValue ?? { articleTypes: [] }).articleTypes
  const tagsReferenced = (defaultValue ?? { tagsReferenced: [] }).tagsReferenced

  const changeValues = newVals => {
    const newValue = { ...defaultValue }
    Object.entries(newVals).forEach(([k, v]) => newValue[k] = v)
    onChange(newValue)
  }

  const onDateRangeChange = (dr) => {
    const [sd, ed] = dr ? dr : [null, null]
    const startDate = momentAsDate(sd)
    const endDate = momentAsDate(ed)
    changeValues({ startDate, endDate })
  }

  const setSearchText = val => {
    changeValues({ searchText: val })
  }
  const setMinWordCount = val => {
    changeValues({ minWordCount: val })
  }
  const setArticleTypes = val => {
    changeValues({ articleTypes: val })
  }
  const setTagsReferenced = val => {
    changeValues({ tagsReferenced: val })
  }

  function disabledDate(current) {
    // Can not select days before today and today
    return current && current > moment().endOf('day');
  }
  return (
    <Space direction='vertical' size='middle'>
      <Space direction='vertical'>
        <Input disabled={isDisabled} placeholder='Search...' value={searchText} onChange={e => setSearchText(e.target.value)} />
      </Space>
      <Space direction='vertical' size='small'>
        <Text>Date range</Text>
        <RangePicker disabledDate={disabledDate} disabled={isDisabled}
          value={[dateAsMoment(startDate), dateAsMoment(endDate)]}
          onChange={onDateRangeChange} />
      </Space>
      <Space direction='horizontal'>
        <Text>Minimum word count</Text>
        <InputNumber value={minWordCount} disabled={isDisabled} onChange={v => setMinWordCount(v)} min={0} />
      </Space>
      <Space direction='vertical' style={{ width: '100%' }}>
        <Text>Article types</Text>
        <Select
          disabled={isDisabled}
          style={{ width: '100%' }}
          mode="multiple"
          value={articleTypes}
          onChange={v => setArticleTypes(v)}>
          {Object.entries(allArticleSettings).map(([key, setting]) =>
            <Option key={key}>{setting.title}</Option>)}
        </Select>
      </Space>
      <Space direction='vertical' style={{ width: '100%' }}>
        <Text>Ref tags in article</Text>
        <Select
          disabled={isDisabled}
          style={{ width: '100%' }}
          mode="multiple"
          value={tagsReferenced}
          onChange={v => setTagsReferenced(v)}>
          {Object.values(allTagEntities).map((te) =>
            <Option key={te.refTag}>#{te.refTag}</Option>)}
        </Select>
      </Space>
    </Space>
  )
}