// Contains/arranges all the journal articles for a given day.
// Has a child button with popup for adding new journal articles to the day.

import React, { Component } from 'react'
import { JournalArticle } from './JournalArticle'
import { List, Typography, Dropdown, Button, Menu, Row, Col } from 'antd';
import { selectArticleIdsForEntry, computeNextArticleId } from '../model/journalEntriesSlice'
import { addArticle, selectArticleById } from '../model/journalArticlesSlice'
import { getStartingContent } from '../model/newArticleStartingContentArbiter'
import { EntryWordCountDisplay } from "./EntryWordCountDisplay"
import { PlusOutlined } from '@ant-design/icons';
import { selectAllArticleSettings, selectArticleSettingByArticleKind } from '../model/settingsSlice'
import { useSelector, useStore, useDispatch } from 'react-redux'
import { apiDateToFe } from "../kitchenSink"

const { Title } = Typography

export const JournalEntry = ({ entryId }) => {
  const articleIds = useSelector((state) => selectArticleIdsForEntry(state, entryId))
  const dispatch = useDispatch()
  const store = useStore()
  function handleAddArticleClick(e) {
    const articleKind = e.key
    const state = store.getState()
    const articleTitle = selectArticleSettingByArticleKind(state, articleKind).title
    const articleId = computeNextArticleId(state, entryId)
    const defaultContent = getStartingContent(articleKind, state)
    const payload = {
      entryId
      , articleId
      , articleKind
      , articleTitle
      , defaultContent
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
      <Row>
        <Col span={12}>
          <Title level={3}>{apiDateToFe(entryId)}</Title>
        </Col>
        <Col span={12}>
          <div style={{ float: 'right' }}>
            <EntryWordCountDisplay entryId={entryId} />
          </div>
        </Col>
      </Row>
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
        <Button block size="large" type="dashed"><PlusOutlined />Add Section</Button>
      </Dropdown>
    </div>
  )
}
