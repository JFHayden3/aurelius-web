import {
  createAsyncThunk,
  createSelector,
  createSlice
} from '@reduxjs/toolkit'
import { API, graphqlOperation } from "aws-amplify"

import { updateJournalArticle, updateTagEntity, updateViceLog } from '../graphql/mutations'
import { convertFeToApiArticle, selectArticlesByIds } from './journalArticlesSlice'
import { selectTagEntitysByIds, convertFeToApiTagEntity } from './tagEntitySlice'
import { selectFetchUserField } from './metaSlice'
import { selectViceLogsByIds, convertFeToApiViceLog } from './viceLogSlice'

const syncDirtyArticles = async (getState) => {
  const dirtyArticleIds = selectSavingEntityIdsByKind(getState(), 'ARTICLE')
  const dirtyArticles = selectArticlesByIds(getState(), dirtyArticleIds)
  if (dirtyArticles.length === 0) return Promise.resolve();
  async function syncArticle(apiJournalArticle) {
    const operation = graphqlOperation(updateJournalArticle,
      { input: apiJournalArticle })

    return API.graphql(operation)
  }
  const userId = selectFetchUserField(getState())
  let promises = dirtyArticles.map(feArticle => convertFeToApiArticle(feArticle, userId)).map(syncArticle)
  return Promise.allSettled(promises)
}

const syncDirtyTagEntitys = async (getState) => {
  const userId = selectFetchUserField(getState())
  const dirtyTeIds = selectSavingEntityIdsByKind(getState(), 'TAG_ENTITY')
  const dirtyTagEntitys = selectTagEntitysByIds(getState(), dirtyTeIds)
  if (dirtyTagEntitys.length === 0) return Promise.resolve();
  async function syncEntity(apiTagEntity) {
    const operation = graphqlOperation(updateTagEntity,
      {
        input:
        {
          userId
          , teId: apiTagEntity.id
          , kind: apiTagEntity.kind
          , entity: JSON.stringify(apiTagEntity)
        }
      })

    return API.graphql(operation)
  }
  let promises = dirtyTagEntitys.map(feTagEntity => convertFeToApiTagEntity(feTagEntity)).map(syncEntity)
  return Promise.allSettled(promises)
}

const syncDirtyViceLogs = async (getState) => {
  const dirtyVlIds = selectSavingEntityIdsByKind(getState(), 'VICE_LOG')
  const dirtyLogs = selectViceLogsByIds(getState(), dirtyVlIds)
  if (dirtyLogs.length === 0) return Promise.resolve();
  async function syncEntity(apiLogEntry) {
    const operation = graphqlOperation(updateViceLog,
      { input: apiLogEntry })

    return API.graphql(operation)
  }
  const userId = selectFetchUserField(getState())
  let promises = dirtyLogs.map(feEntry => convertFeToApiViceLog(feEntry, userId)).map(syncEntity)
  return Promise.allSettled(promises)
}

export const syncDirtyEntities = createAsyncThunk(
  'dirtiness/syncDirtyEntities',
  async (payload, { getState }) => {
    const doSyncArticles = syncDirtyArticles(getState)
    const doSyncTagEntitys = syncDirtyTagEntitys(getState)
    const doSyncViceLogs = syncDirtyViceLogs(getState)
    return Promise.allSettled([doSyncArticles, doSyncTagEntitys, doSyncViceLogs])
  })

export const dirtinessSlice = createSlice({
  name: 'dirtiness',
  initialState: { entities: { ARTICLE: {}, TAG_ENTITY: {}, VICE_LOG: {} } },
  reducers: {
    markDirty(state, action) {
      const { kind, id } = action.payload
      state.entities[kind][id] = 'DIRTY'
    },
  },
  extraReducers: {
    [syncDirtyEntities.pending]: (state, action) => {
      Object.entries(state.entities).forEach(([kind, entDirt]) =>
        Object.entries(entDirt).forEach(([id, dirtiness]) => {
          if (dirtiness === 'DIRTY') {
            state.entities[kind][id] = 'SAVING'
          }
        })
      )
    },
    [syncDirtyEntities.fulfilled]: (state, action) => {
      // TODO: partial failure handling
      Object.entries(state.entities).forEach(([kind, entDirt]) =>
        Object.entries(entDirt).forEach(([id, dirtiness]) => {
          if (dirtiness === 'SAVING') {
            delete state.entities[kind][id]
          }
        })
      )
    },
    [syncDirtyEntities.rejected]: (state, action) => {
      // TODO: smarter fail handling
      Object.entries(state.entities).forEach(([kind, entDirt]) =>
        Object.entries(entDirt).forEach(([id, dirtiness]) => {
          if (dirtiness === 'SAVING') {
            state.entities[kind][id] = 'DIRTY'
          }
        })
      )
    },
    'journalArticles/textUpdated': markArticleDirty,
    'journalArticles/addAgendaTask': markArticleDirty,
    'journalArticles/removeAgendaTask': markArticleDirty,
    'journalArticles/moveAgendaTask': markArticleDirty,
    'journalArticles/updateAgendaTask': markArticleDirty,
    'journalArticles/addAgendaRestriction': markArticleDirty,
    'journalArticles/removeAgendaRestriction': markArticleDirty,
    'journalArticles/updateAgendaRestriction': markArticleDirty,
    'tagEntitys/updateEntity'(state, action) {
      state.entities['TAG_ENTITY'][action.payload.tagEntityId] = 'DIRTY'
    },
    'viceLogs/updateViceLogEntry'(state, action) {
      state.entities['VICE_LOG'][action.payload.id] = 'DIRTY'
    }
  },
})

function markArticleDirty(state, action) {
  state.entities['ARTICLE'][action.payload.articleId] = 'DIRTY'
}

export const { markDirty } = dirtinessSlice.actions

export default dirtinessSlice.reducer

const selectEntitesByKindAndDirtiness = (state, kind, dirtiness) => {
  return Object.entries((state.dirtiness.entities[kind] ?? {}))
    .filter(([k, v]) => v === dirtiness)
    .map(([k, v]) => { return { id: k, dirtiness: v } })
}

const selectEntityIdsByKindAndDirtiness = createSelector(
  [selectEntitesByKindAndDirtiness],
  (entities) => entities.map(e => e.id)
)

const selectDirtyEntitiesByKind =
  (state, kind) => selectEntitesByKindAndDirtiness(state, kind, 'DIRTY')

const selectDirtyEntityIdsByKind = createSelector(
  [(state) => selectDirtyEntitiesByKind(state)],
  (entities) => entities.map(e => e.id)
)

const selectSavingEntitiesByKind =
  (state, kind) => selectEntitesByKindAndDirtiness(state, kind, 'SAVING')

const selectSavingEntityIdsByKind = createSelector(
  [(state, kind) => selectSavingEntitiesByKind(state, kind)],
  (entities) => entities.map(e => e.id)
)

export const isAnyDirty = (state) => {
  return Object.values(state.dirtiness.entities)
    .some(entity => Object.values(entity).some(d => d === 'DIRTY'))
}