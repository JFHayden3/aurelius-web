// Simple container for all the daily journal entries.
// May also add children for searching and filtering later. 
// For now, just responsible for facilitating the infinite scroll behavior

import {JournalEntry} from './JournalEntry'
import React from 'react'
import { List, Card } from 'antd';
import { useSelector } from 'react-redux'
import { selectAllEntries } from '../model/journalEntriesSlice'

export const LifeJournal = () => {
  const entries = useSelector((state) => selectAllEntries(state))
  return (
    <List
      itemLayout="vertical"
      dataSource={entries}
      renderItem={entry =>
        <List.Item key={entry.date}>
          <Card title={new Date(entry.date).toLocaleDateString()}>
            <JournalEntry entryId={entry.id} />
          </Card>
        </List.Item>
      }
    >
    </List>
  )
}

