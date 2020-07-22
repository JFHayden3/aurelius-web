// Simple container for all the daily journal entries.
// May also add children for searching and filtering later. 
// For now, just responsible for facilitating the infinite scroll behavior

import { JournalEntry } from './JournalEntry'
import React from 'react'
import { List, Card } from 'antd';
import { useSelector } from 'react-redux'
import { selectEntryIds } from '../model/journalEntriesSlice'
import { DirtyJournalTracker } from './DirtyJournalTracker'



export const LifeJournal = () => {
  const entryIds = useSelector(selectEntryIds)
  return (
    <div>
      <DirtyJournalTracker/>
      <List
        itemLayout="vertical"
        dataSource={entryIds}
        renderItem={id =>
          <List.Item key={id}>
            <Card>
              <JournalEntry entryId={id} />
            </Card>
          </List.Item>
        }
      >
      </List>
    </div>
  )
}

