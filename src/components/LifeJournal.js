// Simple container for all the daily journal entries.
// May also add children for searching and filtering later. 
// For now, just responsible for facilitating the infinite scroll behavior

import { JournalEntry } from './JournalEntry'
import React from 'react'
import { List, Card } from 'antd';
import { useSelector } from 'react-redux'
import { selectAllEntries } from '../model/journalEntriesSlice'
import { DirtyJournalTracker } from './DirtyJournalTracker'

function apiDateToFe(apiDate) {
  let str = apiDate.toString()
  if (!/^(\d){8}$/.test(str)) {
    console.log("invalid date")
    return NaN
  }
  var y = str.substr(0, 4),
    m = str.substr(4, 2),
    d = str.substr(6, 2);
  return (y + "-" + m + "-" + d);
}

export const LifeJournal = () => {
  const entries = useSelector(selectAllEntries)
  return (
    <div>
      <DirtyJournalTracker/>
      <List
        itemLayout="vertical"
        dataSource={entries}
        renderItem={entry =>
          <List.Item key={entry.id}>
            <Card title={apiDateToFe(entry.date)}>
              <JournalEntry entryId={entry.id} />
            </Card>
          </List.Item>
        }
      >
      </List>
    </div>
  )
}

