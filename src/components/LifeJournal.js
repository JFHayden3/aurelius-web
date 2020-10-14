// Simple container for all the daily journal entries.
// May also add children for searching and filtering later. 
// For now, just responsible for facilitating the infinite scroll behavior

import { JournalEntry } from './JournalEntry'
import React, { useState } from 'react'
import { List, Card, Divider, Layout, Typography, Button, Spin, Drawer, Space, Input, InputNumber } from 'antd';
import { useSelector, useDispatch } from 'react-redux'
import {
  selectEntryIds,
  selectUnfetchedEntriesExist,
  selectEntriesLoading,
  fetchEntries
} from '../model/journalEntriesSlice'
import { changeFilter, selectFilter } from '../model/metaSlice'
import InfiniteScroll from 'react-infinite-scroller';

const { Title, Text } = Typography
const { Header } = Layout

const FilterDrawer = ({ isVisible, close }) => {
  const currentFilter = useSelector(state => selectFilter(state))
  const [minWordCount, setMinWordCount] = useState((currentFilter ?? {}).minWordCount)
  const dispatch = useDispatch()
  const onApply = e => {
    dispatch(changeFilter({ newFilter: { minWordCount: minWordCount } }))
    close()
  }
  const onClear = e => {
    dispatch(changeFilter({ newFilter: null }))
  }
  return (
    <Drawer
      title="Filter entries"
      placement="right"
      visible={isVisible}
      onClose={close}>
      <Space direction='horizontal'>
        <Text>Minimum Word Count</Text>
        <InputNumber value={minWordCount} onChange={v => setMinWordCount(v)} min={0} />
      </Space>
      <Space direction='horizontal'>
        <Button type='primary' onClick={onApply}>Apply</Button>
        <Button type='primary' danger disabled={currentFilter === null} onClick={onClear}>Clear</Button>
      </Space>
    </Drawer>)
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
      fetchEntries({ user: 'testUser', maxEndDate: lastLoadedEntryId, maxNumEntries: 11 }))
  }
  return (
    <div>
      <Button onClick={e => setFilterDrawerVisible(true)}>Open Filter</Button>
      <FilterDrawer isVisible={filterDrawerVisible} close={() => setFilterDrawerVisible(false)} />
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
      </InfiniteScroll>
    </div>
  )
}

