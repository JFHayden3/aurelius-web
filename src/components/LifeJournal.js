// Simple container for all the daily journal entries.
// May also add children for searching and filtering later. 
// For now, just responsible for facilitating the infinite scroll behavior

import { JournalEntry } from './JournalEntry'
import React from 'react'
import { List, Card, Divider, Layout, Typography, Row, Spin } from 'antd';
import { useSelector, useDispatch } from 'react-redux'
import {
  selectEntryIds,
  selectUnfetchedEntriesExist,
  selectEntriesLoading,
  fetchEntries
} from '../model/journalEntriesSlice'
import { DirtyJournalTracker } from './DirtyJournalTracker'
import InfiniteScroll from 'react-infinite-scroller';

const { Title } = Typography
const { Header } = Layout
export const LifeJournal = () => {
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

