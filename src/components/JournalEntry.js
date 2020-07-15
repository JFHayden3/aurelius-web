// Contains/arranges all the journal articles for a given day.
// Has a child button with popup for adding new journal articles to the day.

import React, { Component } from 'react'
import { JournalArticle } from './JournalArticle'
import { List } from 'antd';
import { selectEntryById } from '../model/journalEntriesSlice'
import { useSelector } from 'react-redux'

export const JournalEntry = ({ entryId }) => {
  const entry = useSelector((state) => selectEntryById(state, entryId))
  const articleIds = entry.articleIds
  return (
    <List
      dataSource={articleIds}
      grid={{ gutter: 8, column: 2 }}
      itemLayout="vertical"
      renderItem={articleId =>
        <List.Item key={articleId}>
          <JournalArticle articleId={articleId} />
        </List.Item>
      }
    >
    </List>
  )
}
