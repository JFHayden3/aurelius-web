// Simple container for all the daily journal entries.
// May also add children for searching and filtering later. 
// For now, just responsible for facilitating the infinite scroll behavior

import { JournalEntry } from './JournalEntry'
import React from 'react'
import { List, Card, Divider, Layout, Typography, Row } from 'antd';
import { useSelector } from 'react-redux'
import { selectEntryIds } from '../model/journalEntriesSlice'
import { DirtyJournalTracker } from './DirtyJournalTracker'

const { Title } = Typography
const { Header } = Layout
export const LifeJournal = () => {
  const entryIds = useSelector(selectEntryIds)
  return (
    <div>
      <Header
        style={{ position: 'fixed', zIndex: 1, width: '100%', backgroundColor: '#fff' }}
        title="Daily Journal"
      >
        <Row>
          <Title level={2}>Daily Journal</Title>
          <DirtyJournalTracker />
        </Row>
      </Header>
      <List
        style={{ paddingTop: 66, paddingLeft: 16, paddingRight: 16 }}
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
      </List>
    </div>
  )
}

