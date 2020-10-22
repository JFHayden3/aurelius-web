import React, { useState, useMemo } from 'react'
import { selectViceById, updateEntity } from '../model/tagEntitySlice'
import {
  addArticle,
  fetchFilteredArticles,
  makeSelectArticleDatesByIds,
  selectArticleById,
  updateContent,
  computeNextArticleId
} from '../model/journalArticlesSlice'
import { selectArticleSettingByArticleKind } from '../model/settingsSlice'
import { getStartingContent } from '../model/newArticleStartingContentArbiter'
import { useSelector, useDispatch, useStore } from 'react-redux'
import { PlusOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons'
import { RestrictionEditor } from './RestrictionEditor'
import { DirtyViceTracker } from './DirtyViceTracker'
import { Typography, Row, Col, Button, Collapse, Space, Spin } from 'antd';
import { WrittenResponse, gutter, colSpan, TextItemList } from './ViceVirtueSharedStuff'
import { ViceLogEntry } from './ViceLogEntry'
import { dateAsYyyyMmDd, apiDateToFe, dateAsMoment } from '../kitchenSink'
import { zip } from 'lodash'
import { wait } from '@testing-library/react'
const { Title, Text } = Typography;

export const ViceEditor = ({ match }) => {
  const dispatch = useDispatch()
  const { viceId } = match.params
  const nextViceLogId = useSelector(state => computeNextArticleId(state, dateAsYyyyMmDd(new Date(Date.now()))))
  const vice = useSelector(state => selectViceById(state, viceId))

  const onTextFieldChange = ({ fieldName, value }) => {
    dispatch(updateEntity({ tagEntityId: vice.id, changedFields: { [fieldName]: value } }))
  }
  const onRestrictionIdSelectionChange = newRestrictionId => {
    dispatch(updateEntity(
      {
        tagEntityId: vice.id,
        changedFields: { defaultEngagementRestriction: { kind: newRestrictionId } }
      }))
  }
  const nextMitigationTacticId = vice.mitigationTactics.length > 0 ?
    (Math.max.apply(null, vice.mitigationTactics.map(mt => mt.id)) + 1)
    : 0
  const onAddTacticClick = e => {
    const newTactics = vice.mitigationTactics.concat({ id: nextMitigationTacticId, text: "" })
    dispatch(updateEntity({ tagEntityId: vice.id, changedFields: { mitigationTactics: newTactics } }))
  }
  const onRemoveTactic = (targetId) => {
    const newTactics = vice.mitigationTactics.filter(mt => mt.id !== targetId)
    dispatch(updateEntity({ tagEntityId: vice.id, changedFields: { mitigationTactics: newTactics } }))
  }

  function onTacticTextChange(targetId, str) {
    const newTactics = vice.mitigationTactics.map(tactic => {
      if (tactic.id === targetId) {
        return { id: tactic.id, text: str }
      } else {
        return tactic
      }
    })
    dispatch(updateEntity({ tagEntityId: viceId, changedFields: { mitigationTactics: newTactics } }))
  }
  if (!vice) {
    return (
      <div>Unknown vice</div>
    )
  }
  return (
    <div style={{ margin: 16 }}>
      <Row >
        <Title level={2}>{vice.name}</Title>
        <DirtyViceTracker viceId={viceId} />
      </Row>
      <Row gutter={gutter}>
        <Col>
          <Text strong={true}>Reference Tag</Text>
        </Col>
        <Col>
          <Text code={true}>#{vice.refTag}</Text>
        </Col>
      </Row>
      <Row gutter={gutter}>
        <Col span={4}>
          <Text strong={true}>Default restrictions</Text>
        </Col>
        <Col span={12}>
          <RestrictionEditor
            customKeyId={"V" + vice.id}
            currentRestrictionId={vice.defaultEngagementRestriction.kind}
            onRestrictionIdChange={onRestrictionIdSelectionChange}
            allowSaving={true}
          />
        </Col>
      </Row>
      <WrittenResponse
        text="Description"
        entity={vice}
        fieldName="description"
        minRows={3}
        onValueChange={onTextFieldChange}
      />
      <WrittenResponse
        text="Describe how this behavior negatively impacts your life"
        entity={vice}
        fieldName="negativeImpactDescription"
        onValueChange={onTextFieldChange}
      />
      <WrittenResponse
        text="Describe how you fall into this behavior -- what leads up to you engaging in this?"
        entity={vice}
        fieldName="seductionDescription"
        onValueChange={onTextFieldChange}
      />
      <Row gutter={gutter}>
        <Col span={colSpan}>
          <Text strong={true}>What are some steps you can take to make it more difficult to engage in this behavior or to divert yourself when you feel a strong urge?</Text>
          <TextItemList
            values={vice.mitigationTactics}
            nextId={nextMitigationTacticId}
            onAddItem={onAddTacticClick}
            onRemoveItem={onRemoveTactic}
            onChangeItem={onTacticTextChange}
          />
        </Col>
      </Row>
      <Col span={colSpan}>
        <Space direction='vertical' style={{ width: '100%' }} >
          <Text strong={true}>Log entries</Text>
          <ViceLogsPresenter
            viceRefTag={vice.refTag}
            nextViceLogId={nextViceLogId} />
        </Space>
      </Col>
    </div>
  )
}

const ViceLogsPresenter = ({ nextViceLogId, viceRefTag }) => {
  const [viceLogIds, setViceLogIds] = useState("UNINITIALIZED")
  const [editingLogId, setEditingLogId] = useState(null)
  const [expandedLogPanelIds, setExpandedLogPanelIds] = useState([])
  const dispatch = useDispatch()

  // This is fucky ultimately because of a race condition on the database side:
  // We can't just create the new article and then re-run the filter to get the
  // proper set of vice logs as the new entry won't be included (unless we threadsleep).
  // So we query the initial set of logs, store them in our component state and then
  // manually add new entries to that state upon creation. 
  if (viceLogIds === 'UNINITIALIZED') {
    setViceLogIds('LOADING')
    const viceLogArticleFilter = {
      tagsReferenced: [viceRefTag],
      articleTypes: ['VICE_LOG_V2']
    }
    dispatch(fetchFilteredArticles({ filter: viceLogArticleFilter }))
      .then(r => {
        setViceLogIds(r.payload.items.map(art => art.id))
      })
  }

  const selectArticleDatesByIds = useMemo(makeSelectArticleDatesByIds, [])
  const viceLogDates = useSelector(state => selectArticleDatesByIds(state, viceLogIds))
  const viceLogIdsAndDates = viceLogIds && Array.isArray(viceLogIds) ?
    zip(viceLogIds, viceLogDates) : []

  const store = useStore()
  const onAddViceLogEntryClick = e => {
    const state = store.getState()
    const articleKind = 'VICE_LOG_V2'
    const articleTitle = selectArticleSettingByArticleKind(state, articleKind).title
    const defaultContent = getStartingContent(articleKind, state)
    const todayYyyMmDd = dateAsYyyyMmDd(new Date(Date.now()))
    defaultContent.vices = [viceRefTag]
    defaultContent.date = todayYyyMmDd
    const payload = {
      entryId: todayYyyMmDd
      , articleId: nextViceLogId
      , articleKind
      , articleTitle
      , defaultContent
    }
    dispatch(addArticle(payload))
      .then(res => {
        setViceLogIds(viceLogIds.concat([payload.articleId]))
        setEditingLogId(payload.articleId)
        setExpandedLogPanelIds(expandedLogPanelIds.concat("" + payload.articleId))
      })
  }
  const onLogPanelExpansionChange = val => {
    if (!val.includes(editingLogId + "")) {
      setEditingLogId(null)
    }
    setExpandedLogPanelIds(val)
  }
  function onEditViceLogEntryClick(logId) {
    return e => {
      e.stopPropagation()
      if (logId !== null && !expandedLogPanelIds.includes("" + logId)) {
        setExpandedLogPanelIds(expandedLogPanelIds.concat("" + logId))
      }
      setEditingLogId(logId)
    }
  }

  return (
    <div>
      {(!viceLogIds || viceLogIds === 'LOADING') &&
        <Spin />
      }
      {viceLogIds && Array.isArray(viceLogIds) &&
        <Space direction='vertical' style={{ width: '100%' }}>
          <Collapse activeKey={expandedLogPanelIds} onChange={onLogPanelExpansionChange} >
            {viceLogIdsAndDates.map(([id, date]) =>
              <Collapse.Panel key={id}
                header={apiDateToFe(date)}
                extra={(
                  <div>
                    {editingLogId !== id &&
                      <Button size="small" type="text" onClick={onEditViceLogEntryClick(id)}>
                        <EditOutlined />
                      </Button>}
                    {editingLogId === id &&
                      <Button size="small" type="text"
                        onClick={onEditViceLogEntryClick(null)}>
                        <CheckOutlined />
                      </Button>}
                  </div>)}>
                <ViceLogPanel
                  logArticleId={id}
                  isEditing={editingLogId === id} />
              </Collapse.Panel>
            )}
          </Collapse>
          <Button block size="large" type="dashed" onClick={onAddViceLogEntryClick}><PlusOutlined />Add Entry</Button>
        </Space>
      }
    </div>
  )
}

const ViceLogPanel = ({ logArticleId, isEditing }) => {
  const logEntry = useSelector(state => selectArticleById(state, logArticleId))
  const dispatch = useDispatch()
  const onFieldChange = cf => {
    const payload = { articleId: logArticleId, changedFields: cf }
    dispatch(updateContent(payload))
  }
  return (
    <ViceLogEntry entry={logEntry.content} onChange={onFieldChange} isReadOnlyMode={!isEditing} />
  )
}