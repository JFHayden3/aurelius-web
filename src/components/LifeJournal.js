// Simple container for all the daily journal entries.
// May also add children for searching and filtering later. 
// For now, just responsible for facilitating the infinite scroll behavior

import { JournalEntry } from './JournalEntry'
import React, { useState } from 'react'
import {
  Affix,
  List, Card, Divider, Layout, Typography,
  Button, Spin, Drawer, Space, Input, InputNumber, DatePicker,
  Select,
  Tooltip
} from 'antd';
import { SearchOutlined } from '@ant-design/icons'

import { useSelector, useDispatch } from 'react-redux'
import { dateAsMoment, momentAsDate } from '../kitchenSink'
import {
  selectEntryIds,
  selectUnfetchedEntriesExist,
  selectEntriesLoading,
  fetchEntries
} from '../model/journalEntriesSlice'
import { selectAllTagEntitys } from '../model/tagEntitySlice'
import { changeFilter, selectFilter } from '../model/metaSlice'
import { selectAllArticleSettings } from '../model/settingsSlice'
import InfiniteScroll from 'react-infinite-scroller';
import moment from 'moment'

const pageSize = 11
const { Title, Text } = Typography
const { Header } = Layout
const { RangePicker } = DatePicker
const { Option } = Select;

const FilterDrawer = ({ close }) => {
  const currentFilter = useSelector(state => selectFilter(state))
  const allArticleSettings = useSelector((state) => selectAllArticleSettings(state))
  const allTagEntities = useSelector((state) => selectAllTagEntitys(state))
  
  const [searchText, setSearchText] = useState((currentFilter ?? {}).searchText)
  const [minWordCount, setMinWordCount] = useState((currentFilter ?? {}).minWordCount)
  const [startDate, setStartDate] = useState((currentFilter ?? {}).startDate)
  const [endDate, setEndDate] = useState((currentFilter ?? {}).endDate)
  const [articleTypes, setArticleTypes] = useState((currentFilter ?? { articleTypes: [] }).articleTypes)
  const [tagsReferenced, setTagsReferenced] = useState((currentFilter ?? { tagsReferenced: [] }).tagsReferenced)

  const dispatch = useDispatch()

  function dispatchChangeFilter(newFilter) {
    dispatch(changeFilter({ newFilter }))
      .then(r => dispatch(fetchEntries({ maxEndDate: null, maxNumEntries: pageSize })))
  }
  const onDateRangeChange = ([sd, ed]) => {
    const startDate = momentAsDate(sd)
    const endDate = momentAsDate(ed)
    setStartDate(startDate)
    setEndDate(endDate)
  }
  const onApply = e => {
    dispatchChangeFilter({ searchText, minWordCount, startDate, endDate, articleTypes, tagsReferenced })
    close()
  }
  const onClear = e => {
    setSearchText(null)
    dispatchChangeFilter(null)
    setMinWordCount(null)
    setStartDate(null)
    setEndDate(null)
    setArticleTypes([])
    setTagsReferenced([])
  }
  function disabledDate(current) {
    // Can not select days before today and today
    return current && current > moment().endOf('day');
  }
  return (
    <Space direction='vertical' size='middle'>
      <Space direction='vertical'>
        <Input placeholder='Search...' value={searchText} onChange={e => setSearchText(e.target.value)} />
      </Space>
      <Space direction='vertical' size='small'>
        <Text>Date range</Text>
        <RangePicker disabledDate={disabledDate}
          value={[dateAsMoment(startDate), dateAsMoment(endDate)]}
          onChange={onDateRangeChange} />
      </Space>
      <Space direction='horizontal'>
        <Text>Minimum word count</Text>
        <InputNumber value={minWordCount} onChange={v => setMinWordCount(v)} min={0} />
      </Space>
      <Space direction='vertical' style={{ width: '100%' }}>
        <Text>Article types</Text>
        <Select
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
          style={{ width: '100%' }}
          mode="multiple"
          value={tagsReferenced}
          onChange={v => setTagsReferenced(v)}>
          {Object.values(allTagEntities).map((te) =>
            <Option key={te.refTag}>#{te.refTag}</Option>)}
        </Select>
      </Space>
      <Space direction='horizontal'>
        <Button type='primary' onClick={onApply}>Apply</Button>
        <Button type='primary' danger disabled={currentFilter === null} onClick={onClear}>Clear</Button>
      </Space>
    </Space>
  )
}

export const LifeJournal = () => {
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false)
  const dispatch = useDispatch()
  const entryIds = useSelector(selectEntryIds)
  const isLoading = useSelector(state => selectEntriesLoading(state))
  const hasMoreUnfetchedEntries = useSelector(state => selectUnfetchedEntriesExist(state))
  const handleInfiniteOnLoad = (pageNum) => {
    const lastLoadedEntryId = entryIds[entryIds.length - 1]
    dispatch(
      fetchEntries({ maxEndDate: lastLoadedEntryId, maxNumEntries: pageSize }))
  }
  const onSearchClick = e => {
    setFilterDrawerVisible(true)
  }
  return (
    <div>
      <Drawer
        destroyOnClose
        width={300}
        placement="right"
        visible={filterDrawerVisible}
        onClose={() => setFilterDrawerVisible(false)}>
        <FilterDrawer close={() => setFilterDrawerVisible(false)} />
      </Drawer>
      <InfiniteScroll
        initialLoad={false}
        pageStart={0}
        loadMore={handleInfiniteOnLoad}
        hasMore={hasMoreUnfetchedEntries}
        useWindow={true}>
        <List
          style={{ paddingTop: 16, paddingLeft: 16, paddingRight: 16 }}
          itemLayout="vertical"
          dataSource={entryIds}
          renderItem={id =>
            <List.Item key={id}>
              <Card>
                <JournalEntry entryId={id} />
              </Card>
              <Divider />
            </List.Item>
          }
        >
          {isLoading &&
            <div syle={{
              position: 'absolute',
              bottom: '40px',
              width: '100%',
              textAlign: 'center'
            }}>
              <Spin />
            </div>}
        </List>
        <Affix offsetBottom={70} style={{ position: 'absolute', left: '90%' }}>
          <Tooltip title="Search">
            <Button type='primary' shape='circle' size='large' onClick={onSearchClick}>
              <SearchOutlined />
            </Button>
          </Tooltip>
        </Affix>
      </InfiniteScroll>
    </div>
  )
}

