// Contains/arranges all the journal articles for a given day.
// Has a child button with popup for adding new journal articles to the day.

import React, { useState } from 'react'
import { JournalArticle } from './JournalArticle'
import { List, Typography, Dropdown, Button, Menu, Row, Col, Affix } from 'antd';
import {
  addArticle, selectArticleById,
  selectFilteredArticleIdsByEntryId,
  selectArticleIdsByEntryId, computeNextArticleId
} from '../model/journalArticlesSlice'
import { getStartingContent } from '../model/newArticleStartingContentArbiter'
import { EntryWordCountDisplay } from "./EntryWordCountDisplay"
import { PlusOutlined } from '@ant-design/icons';
import { selectAllArticleSettings, selectArticleSettingByArticleKind } from '../model/settingsSlice'
import { useSelector, useStore, useDispatch } from 'react-redux'
import { apiDateToFe } from "../kitchenSink"
import { CreateNewPromptModal } from "./CreateNewPromptModal"

const { Title } = Typography

export const JournalEntry = ({ entryId }) => {
  const [newPromptModalVisible, setNewPromptModalVisible] = useState(false)
  // TODO: when there are articles filtered for a given entry, provide the user a way to manually
  // show those articles even if they don't match the filter or at least communicate to the user that
  // they exist
  const articleIds = useSelector((state) => selectFilteredArticleIdsByEntryId(state, entryId))
  const unfilteredArticleIds = useSelector(state => selectArticleIdsByEntryId(state, entryId))
  const allArticleSettings = useSelector((state) => selectAllArticleSettings(state))
  const dispatch = useDispatch()
  const store = useStore()
  function addNewArticle(articleKind) {
    const state = store.getState()
    const articleTitle = selectArticleSettingByArticleKind(state, articleKind).title
    const articleId = computeNextArticleId(state, entryId)
    const defaultContent = getStartingContent(articleKind, state, dispatch)
    const payload = {
      entryId
      , articleId
      , articleKind
      , articleTitle
      , defaultContent
    }
    dispatch(addArticle(payload))
  }
  function handleAddArticleClick(e) {
    addNewArticle(e.key)
  }
  function handleCreateNewPromptClick(e) {
    setNewPromptModalVisible(true)
  }
  function onNewPromptOk(newPromptKey) {
    setNewPromptModalVisible(false)
    addNewArticle(newPromptKey)
  }
  const articleKindsInEntry =
    unfilteredArticleIds.map((id) => selectArticleById(store.getState(), id).kind)
  const menu = (
    <Menu>
      {Object.entries(allArticleSettings)
        .map(([kind, settings]) =>
          <Menu.Item
            key={kind}
            disabled={articleKindsInEntry.includes(kind)}
            onClick={handleAddArticleClick}>
            {settings.title}
          </Menu.Item>)}
      <Menu.Divider />
      <Menu.Item onClick={handleCreateNewPromptClick} key="createNew">
        Create new...
      </Menu.Item>
    </Menu>
  )
  const [container, setContainer] = useState(null);

  return (
    <div ref={setContainer}>
      <Affix >
        <Row style={{ backgroundColor: 'white', borderBottomStyle: 'solid', borderBottomWidth: '1px' }}>
          <Col span={12}>
            <Title level={3}>{apiDateToFe(entryId)}</Title>
          </Col>
          <Col span={12}>
            <div style={{ float: 'right' }}>
              <EntryWordCountDisplay entryId={entryId} />
            </div>
          </Col>
        </Row>
      </Affix>
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
      <CreateNewPromptModal isVisible={newPromptModalVisible} onClose={() => setNewPromptModalVisible(false)} onConfirm={onNewPromptOk} />
    </div>
  )
}
