import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice
} from '@reduxjs/toolkit'
import { API, graphqlOperation } from "aws-amplify"
import { selectFetchUserField } from './metaSlice'

import { createJournalArticle, updateJournalArticle, deleteJournalArticle } from '../graphql/mutations'
import { } from '../graphql/queries'
import { selectViceLogById } from './viceLogSlice'

const articlesAdapter = createEntityAdapter({
  sortComparer: (a, b) => a.id - b.id
})

const initialState = articlesAdapter.getInitialState()

function convertFeToApi(feArticle, userId) {
  return {
    userId
    , jaId: feArticle.id
    , entryId: feArticle.entryId
    , kind: feArticle.kind
    , content: JSON.stringify({ title: feArticle.title, content: feArticle.content })
  }
}

function convertApiToFe(apiArticle) {
  const { title, content } = JSON.parse(apiArticle.content)
  return {
    id: Number.parseInt(apiArticle.jaId),
    entryId: Number.parseInt(apiArticle.entryId),
    kind: apiArticle.kind,
    title,
    content,
    dirtiness: 'CLEAN'
  }
}

export const syncDirtyArticles = createAsyncThunk(
  'journalArticles/syncDirtyArticles',
  async (payload, { getState }) => {
    const dirtyArticles = selectByDirtiness(getState(), 'SAVING')
    if (dirtyArticles.length === 0) return Promise.resolve();
    async function syncArticle(apiJournalArticle) {
      const operation = graphqlOperation(updateJournalArticle,
        { input: apiJournalArticle })

      return API.graphql(operation)
    }
    const userId = selectFetchUserField(getState())
    let promises = dirtyArticles.map(feArticle => convertFeToApi(feArticle, userId)).map(syncArticle)
    return Promise.allSettled(promises)
  }
)

export const addArticle = createAsyncThunk(
  'journalArticles/addArticle',
  async (payload, { getState }) => {
    const { entryId, articleId, articleKind, articleTitle, defaultContent } = payload
    const newArticle = {
      id: articleId,
      entryId,
      kind: articleKind,
      title: articleTitle,
      content: defaultContent,
      dirtiness: 'CLEAN'
    }

    const userId = selectFetchUserField(getState())
    const operation = graphqlOperation(createJournalArticle,
      {
        input: convertFeToApi(newArticle, userId),
      })
    // TODO: figure out how best to do article creation and ID-uniqueness
    // Let's just do something dumb for now so I can start using this and iterating
    // interactively:
    // - Hardcoding 2 article IDs in here which will be picked up in a reducer
    // - in articlesSlice and will automatically create entries for refelections,
    // intetions, and agenda
    return API.graphql(operation).then(r => { return { newArticle } })
  }
)

export const removeArticle = createAsyncThunk(
  'journalArticles/removeArticle',
  async (payload, { getState }) => {
    const { articleId } = payload
    const userId = selectFetchUserField(getState())
    const operation = graphqlOperation(deleteJournalArticle,
      {
        input: {
          userId,
          jaId: articleId,
        }
      })
    return API.graphql(operation).then(r => { return { articleId } })
  }
)

export const journalArticlesSlice = createSlice({
  name: 'journalArticles',
  initialState,
  reducers: {
    textUpdated(state, action) {
      const { articleId, text } = action.payload
      const existingArticle = state.entities[articleId]
      if (existingArticle) {
        existingArticle.content.text = text
        existingArticle.dirtiness = 'DIRTY'
      }
    },
    addAgendaTask(state, action) {
      const { articleId, addIndex, newTask } = action.payload
      const agendaArticle = state.entities[articleId]
      agendaArticle.content.tasks.splice(addIndex, 0, newTask)
      agendaArticle.dirtiness = 'DIRTY'
    },
    removeAgendaTask(state, action) {
      const { articleId, removeId } = action.payload
      const agendaArticle = state.entities[articleId]
      agendaArticle.content.tasks = agendaArticle.content.tasks.filter(task => task.id != removeId)
      agendaArticle.dirtiness = 'DIRTY'
    },
    moveAgendaTask(state, action) {
      const { articleId, taskIdToMove, toIndex } = action.payload
      const agendaArticle = state.entities[articleId]
      const oldIndex = agendaArticle.content.tasks.findIndex(t => t.id === taskIdToMove)
      const taskToMove = agendaArticle.content.tasks[oldIndex]
      agendaArticle.content.tasks.splice(oldIndex, 1)
      agendaArticle.content.tasks.splice(oldIndex < toIndex ? toIndex - 1 : toIndex, 0, taskToMove)
      agendaArticle.dirtiness = 'DIRTY'
    },
    updateAgendaTask(state, action) {
      const { articleId, taskId, changedFields } = action.payload
      const agendaArticle = state.entities[articleId]
      const taskToUpdate = agendaArticle.content.tasks.find(task => task.id === taskId)
      Object.entries(changedFields).forEach(([field, value]) => taskToUpdate[field] = value)
      agendaArticle.dirtiness = 'DIRTY'
    },
    addAgendaRestriction(state, action) {
      const { articleId } = action.payload
      const agendaArticle = state.entities[articleId]
      const newId = agendaArticle.content.restrictions.length > 0 ?
        Math.max.apply(null, agendaArticle.content.restrictions.map(r => r.id)) + 1
        : 0
      const newRestriction = {
        id: newId,
        restriction: "",
        activities: [],
        optNote: null
      }
      agendaArticle.content.restrictions.push(newRestriction)
      agendaArticle.dirtiness = 'DIRTY'
    },
    removeAgendaRestriction(state, action) {
      const { articleId, removeId } = action.payload
      const agendaArticle = state.entities[articleId]
      agendaArticle.content.restrictions = agendaArticle.content.restrictions.filter(r => r.id != removeId)
      agendaArticle.dirtiness = 'DIRTY'
    },
    updateAgendaRestriction(state, action) {
      const { articleId, restrictionId, changedFields } = action.payload
      const agendaArticle = state.entities[articleId]
      const restrictionToUpdate = agendaArticle.content.restrictions.find(r => r.id === restrictionId)
      Object.entries(changedFields).forEach(([field, value]) => restrictionToUpdate[field] = value)
      agendaArticle.dirtiness = 'DIRTY'
    }
  },
  extraReducers: {
    [removeArticle.fulfilled]: (state, action) => {
      const { articleId } = action.payload
      articlesAdapter.removeOne(state, articleId)
    },
    [addArticle.fulfilled]: (state, action) => {
      articlesAdapter.addOne(state, action.payload.newArticle)
    },
    [syncDirtyArticles.pending]: (state, action) => {
      const articlesInFlight = Object.values(state.entities).filter((article) => article.dirtiness === 'DIRTY')
      articlesInFlight.forEach((article) => article.dirtiness = 'SAVING')
    },
    [syncDirtyArticles.fulfilled]: (state, action) => {
      const articlesInFlight = Object.values(state.entities).filter((article) => article.dirtiness === 'SAVING')
      // Only set the in-flight entries to 'CLEAN' so any changes made during
      // the request will be sent on the next fetch.
      articlesInFlight
        .filter((article) => article.dirtiness === 'SAVING')
        .forEach((article) => article.dirtiness = 'CLEAN')
    },
    [syncDirtyArticles.rejected]: (state, action) => {
      const articlesInFlight = Object.values(state.entities).filter((article) => article.dirtiness === 'SAVING')
      // TODO surface error, switch gui togle to manual rather than timed
      articlesInFlight
        .filter((article) => article.dirtiness === 'SAVING')
        .forEach((article) => article.dirtiness = 'DIRTY')
    },
    'journalEntries/fetchEntries/fulfilled': (state, action) => {
      // Note that the payload here is formed in the async thunk in
      // Journal entries slice as that's where we first fondle the
      // fetched results.
      articlesAdapter.addMany(state, action.payload.articles.map(convertApiToFe))
    },
  }
})

export function computeNextArticleId(state, forEntryId) {
  const existingIds = selectArticleIdsByEntryId(state, forEntryId)
  return (!existingIds || existingIds.length === 0)
    ? Number.parseInt(forEntryId + "001")
    : Math.max.apply(null, existingIds) + 1
}

export const { textUpdated,
  addAgendaTask,
  removeAgendaTask,
  updateAgendaTask,
  moveAgendaTask,
  addAgendaRestriction,
  removeAgendaRestriction,
  updateAgendaRestriction } = journalArticlesSlice.actions

export default journalArticlesSlice.reducer

// Export the customized selectors for this adapter using `getSelectors`
export const {
  selectAll: selectAllArticles,
  selectById: selectArticleById,
  selectIds: selectArticleIds
  // Pass in a selector that returns the posts slice of state
} = articlesAdapter.getSelectors(state => state.journalArticles)

export const selectArticlesByIds =
  (state, articleIds) => {
    return articleIds.map(id => state.journalArticles.entities[id])
  }

export const selectArticlesByEntryId = createSelector(
  [selectAllArticles, (state, entryId) => entryId],
  (articles, entryId) => articles.filter(article => article.entryId == entryId)
)

export const selectArticleIdsByEntryId = createSelector(
  [(state, entryId) => selectArticlesByEntryId(state, entryId)],
  (articles) => articles.map(article => article.id)
)

export const selectArticleTitleById = createSelector(
  [selectArticleById],
  (article) => article ? article.title : null
)

export const selectArticleKindById = createSelector(
  [selectArticleById],
  (article) => article ? article.kind : null
)

export const selectArticlesByDate = createSelector(
  [selectAllArticles, (state, date) => date],
  (articles, date) => articles.filter((entry) => entry.date === date)
)

export const selectTaskById = createSelector(
  [selectArticleById, (state, articleId, taskId) => (articleId, taskId)],
  (article, taskId) => article.content.tasks.find(task => task.id === taskId)
)

export const selectRestrictionById = createSelector(
  [selectArticleById, (state, articleId, restrictionId) => (articleId, restrictionId)],
  (article, restrictionId) => article.content.restrictions.find(r => r.id === restrictionId)
)

function getWordCount(article, state) {
  function countWords(s) {
    s = s.replace(/(^\s*)|(\s*$)/gi, "");//exclude  start and end white-space
    s = s.replace(/[ ]{2,}/gi, " ");//2 or more space to 1
    s = s.replace(/\n /, "\n"); // exclude newline with a start spacing
    return s.split(' ').filter(String).length;
  }
  function countWordsInBlocks(rawValue) {
    if (!rawValue) {
      return 0
    } else {
      // Mainly me being lazy for historical entries.
      return (rawValue.blocks ?? []).reduce((total, block) => total + countWords(block.text), 0)
    }
  }
  switch (article.kind) {
    case 'AGENDA':
      const textCount = countWordsInBlocks(article.content.text)
      const taskCount = article.content.tasks.reduce((total, task) => total + countWords(task.optNotes ?? ""), 0)
      // Me being lazy to avoid deleting old entries created before there were restrictions
      const restrictionCount = (article.content.restrictions ?? []).reduce((total, r) => total + countWords(r.optNote ?? ""), 0)
      return textCount + taskCount + restrictionCount
    case 'VICE_LOG':
      const viceLog = selectViceLogById(state, article.content.logId)
      return (
        countWords(viceLog.failureAnalysis) +
        countWords(viceLog.impactAnalysis) +
        countWords(viceLog.counterfactualAnalysis) +
        countWords(viceLog.attonement))
    default:
      return countWordsInBlocks(article.content.text)
  }
}

export const selectWordCount = createSelector(
  [selectArticlesByIds, (state, ids) => state],
  (articles, state) => articles.reduce((total, article) => total + getWordCount(article, state), 0)
)

export const selectByDirtiness = createSelector(
  [selectAllArticles, (state, dirtiness) => dirtiness],
  (articles, dirtiness) => articles.filter((article) => article.dirtiness === dirtiness)
)
