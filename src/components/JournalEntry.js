// Contains/arranges all the journal articles for a given day.
// Has a child button with popup for adding new journal articles to the day.

import React, { Component } from 'react'
import { JournalArticle } from './JournalArticle'
import { List, Divider, Dropdown, Button, Menu } from 'antd';
import { selectEntryById, computeNextArticleId } from '../model/journalEntriesSlice'
import { addArticle, selectArticleById } from '../model/journalArticlesSlice'
import { selectAllArticleSettings, selectArticleSettingByArticleKind } from '../model/settingsSlice'
import { useSelector, useStore, useDispatch } from 'react-redux'
import { apiDateToFe } from "../kitchenSink"


export const JournalEntry = ({ entryId }) => {
  const entry = useSelector((state) => selectEntryById(state, entryId))
  const articleIds = entry.articleIds
  const dispatch = useDispatch()
  const store = useStore()
  function handleAddArticleClick(e) {
    const articleKind = e.key
    const articleSettings = selectArticleSettingByArticleKind(store.getState(), articleKind)
    const articleId = computeNextArticleId(store.getState(), entryId)
    const payload = {
      entryId
      , articleId
      , articleKind
      , articleSettings
    }
    dispatch(addArticle(payload))
  }
  const articleKindsInEntry =
    articleIds.map((id) => selectArticleById(store.getState(), id).kind)
  const menu = (
    <Menu>
      {Object.entries(selectAllArticleSettings(useStore().getState()))
        .map(([kind, settings]) =>
          <Menu.Item
            key={kind}
            disabled={articleKindsInEntry.includes(kind)}
            onClick={handleAddArticleClick}>
            {settings.title}
          </Menu.Item>)}
      <Menu.Divider />
      <Menu.Item key="createNew">Create new...</Menu.Item>
    </Menu>
  )
  return (
    <div>
      <h2>{apiDateToFe(entry.date)}</h2>
      <List
        dataSource={articleIds}
        itemLayout="vertical"
        renderItem={articleId =>
          <List.Item key={articleId} style={{ borderBottom: 'none', paddingBottom: '6px', paddingTop: '6px' }}>
            <JournalArticle articleId={articleId} />
          </List.Item>
        }
      >
      </List>
      <Dropdown overlay={menu} trigger={['click']}>
        <Button block size="large" type="dashed">Add Section</Button>
      </Dropdown>
    </div>
  )
}
