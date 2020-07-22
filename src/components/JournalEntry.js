// Contains/arranges all the journal articles for a given day.
// Has a child button with popup for adding new journal articles to the day.

import React, { Component } from 'react'
import { JournalArticle } from './JournalArticle'
import { List, Divider } from 'antd';
import { selectEntryById } from '../model/journalEntriesSlice'
import { useSelector } from 'react-redux'
import { apiDateToFe } from "../kitchenSink"

export const JournalEntry = ({ entryId }) => {
  const entry = useSelector((state) => selectEntryById(state, entryId))
  const articleIds = entry.articleIds
  return (
    <div>
      <h2>{apiDateToFe(entry.date)}</h2>
      <List
        dataSource={articleIds}
        itemLayout="vertical"
        renderItem={articleId =>
          <List.Item key={articleId} style={{ borderBottom: 'none' }}>
            <JournalArticle articleId={articleId} />
          </List.Item>
        }
      >
      </List>
    </div>
  )
}
