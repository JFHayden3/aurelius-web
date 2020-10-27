// Simple container for all the daily journal entries.
// May also add children for searching and filtering later. 
// For now, just responsible for facilitating the infinite scroll behavior

import { JournalEntry } from './JournalEntry'
import React, { useState } from 'react'
import {
  Affix,
  List, Card, Divider,
  Button, Spin, Drawer, Space,
  Tooltip
} from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { ExportModal } from './ExportModal'
import { ArticleFilterWidget } from './ArticleFilterWidget'
import {
  selectEntryIds,
  selectUnfetchedEntriesExist,
  selectEntriesLoading,
  fetchEntries
} from '../model/journalEntriesSlice'
import { changeFilter, selectFilter } from '../model/metaSlice'
import InfiniteScroll from 'react-infinite-scroller';

const pageSize = 11

const FilterDrawer = ({ close }) => {
  const currentFilter = useSelector(state => selectFilter(state))
  const emptyFilter = { articleTypes: [], tagsReferenced: [] }
  const [filterValue, setFilterValue] = useState(currentFilter ?? emptyFilter)

  const dispatch = useDispatch()

  const onApply = e => {
    dispatch(changeFilter({ newFilter: filterValue }))
      .then(r => dispatch(fetchEntries({ maxEndDate: null, maxNumEntries: pageSize })))
    close()
  }
  const onClear = e => {
    setFilterValue(emptyFilter)
  }
  return (
    <Space direction='vertical' size='middle'>
      <ArticleFilterWidget defaultValue={filterValue} onChange={v => setFilterValue(v)} />
      <Space direction='horizontal'>
        <Button type='primary' onClick={onApply}>Apply</Button>
        <Button type='primary' danger disabled={currentFilter === null} onClick={onClear}>Clear</Button>
      </Space>
    </Space>
  )
}

export const LifeJournal = () => {
  const [exportModalVisible, setExportModalVisible] = useState(false)
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
  const onDownloadClick = e => {
    setExportModalVisible(true)
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
        <Affix offsetBottom={120} style={{ position: 'absolute', left: '90%' }}>
          <Tooltip title="Download">
            <Button type='primary' shape='circle' size='large' onClick={onDownloadClick}>
              <DownloadOutlined />
            </Button>
          </Tooltip>
        </Affix>
        <Affix offsetBottom={70} style={{ position: 'absolute', left: '90%' }}>
          <Tooltip title="Search">
            <Button type='primary' shape='circle' size='large' onClick={onSearchClick}>
              <SearchOutlined />
            </Button>
          </Tooltip>
        </Affix>
      </InfiniteScroll>
      <ExportModal isVisible={exportModalVisible} close={e => setExportModalVisible(false)} />
    </div>
  )
}

