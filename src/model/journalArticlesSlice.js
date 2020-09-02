import {
  createEntityAdapter,
  createSelector,
  createSlice
} from '@reduxjs/toolkit'
import { selectViceLogById } from './viceLogSlice'

const articlesAdapter = createEntityAdapter()

const initialState = articlesAdapter.getInitialState()

export const journalArticlesSlice = createSlice({
  name: 'journalArticles',
  initialState,
  reducers: {
    addArticle(state, action) {
      const { entryId, articleId, articleKind, articleTitle, defaultContent } = action.payload
      const newArticle = {
        id: articleId,
        kind: articleKind,
        title: articleTitle,
        content: defaultContent
      }
      articlesAdapter.upsertOne(state, newArticle)
    },
    removeArticle(state, action) {
      const { articleId } = action.payload
      articlesAdapter.removeOne(state, articleId)
    },
    textUpdated(state, action) {
      const { articleId, text } = action.payload
      const existingArticle = state.entities[articleId]
      if (existingArticle) {
        existingArticle.content.text = text
      }
    },
    addAgendaTask(state, action) {
      const { articleId, addIndex } = action.payload
      const agendaArticle = state.entities[articleId]
      const newId = agendaArticle.content.tasks.length > 0 ?
        Math.max.apply(null, agendaArticle.content.tasks.map(task => task.id)) + 1
        : 0
      const newTask = {
        id: newId,
        activity: { content: "", kind: "CUSTOM" }
      }
      agendaArticle.content.tasks.splice(addIndex, 0, newTask)
    },
    removeAgendaTask(state, action) {
      const { articleId, removeId } = action.payload
      const agendaArticle = state.entities[articleId]
      agendaArticle.content.tasks = agendaArticle.content.tasks.filter(task => task.id != removeId)
    },
    updateAgendaTask(state, action) {
      const { articleId, taskId, changedFields } = action.payload
      const agendaArticle = state.entities[articleId]
      const taskToUpdate = agendaArticle.content.tasks.find(task => task.id === taskId)
      Object.entries(changedFields).forEach(([field, value]) => taskToUpdate[field] = value)
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
    },
    removeAgendaRestriction(state, action) {
      const { articleId, removeId } = action.payload
      const agendaArticle = state.entities[articleId]
      agendaArticle.content.restrictions = agendaArticle.content.restrictions.filter(r => r.id != removeId)
    },
    updateAgendaRestriction(state, action) {
      const { articleId, restrictionId, changedFields } = action.payload
      const agendaArticle = state.entities[articleId]
      const restrictionToUpdate = agendaArticle.content.restrictions.find(r => r.id === restrictionId)
      Object.entries(changedFields).forEach(([field, value]) => restrictionToUpdate[field] = value)
    }
  },
  extraReducers: {
    // TODO: either consolidate here or remove the need for a separate initial fetch method
    'journalEntries/fetchEntries/fulfilled': (state, action) => {
      // Note that the payload here is formed in the async thunk in
      // Journal entries slice as that's where we first fondle the
      // fetched results.
      articlesAdapter.addMany(state, action.payload.articles)
    },
  }
})

export const { textUpdated,
  addArticle,
  removeArticle,
  addAgendaTask,
  removeAgendaTask,
  updateAgendaTask,
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