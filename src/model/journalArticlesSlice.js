import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import { defaultMemoize, createSelectorCreator } from 'reselect'
import { API, graphqlOperation } from "aws-amplify"
import { selectFetchUserField, selectFilteredKeys } from './metaSlice'
import { createJournalArticle, deleteJournalArticle } from '../graphql/mutations'
import { selectViceLogById } from './viceLogSlice'
import { isEqual } from 'lodash'


const articlesAdapter = createEntityAdapter({
  sortComparer: (a, b) => a.id - b.id
})

const initialState = articlesAdapter.getInitialState()

export function convertFeToApiArticle(feArticle, userId, state) {
  return {
    userId
    , jaId: feArticle.id
    , entryId: feArticle.entryId
    , kind: feArticle.kind
    , content: JSON.stringify({ title: feArticle.title, content: feArticle.content })
    , searchableText: extractUserText(feArticle, state)
    , refTags: extractRefTags(feArticle, state)
    , wordCount: getWordCount(feArticle, state)
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
    const state = getState()
    const userId = selectFetchUserField(state)
    const operation = graphqlOperation(createJournalArticle,
      {
        input: convertFeToApiArticle(newArticle, userId, state),
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
      }
    },
    updateContent(state, action) {
      const { articleId, changedFields } = action.payload
      const article = state.entities[articleId]
      Object.entries(changedFields).forEach(([field, value]) => article.content[field] = value)
    },
    addAgendaTask(state, action) {
      const { articleId, addIndex, newTask } = action.payload
      const agendaArticle = state.entities[articleId]
      agendaArticle.content.tasks.splice(addIndex, 0, newTask)
    },
    removeAgendaTask(state, action) {
      const { articleId, removeId } = action.payload
      const agendaArticle = state.entities[articleId]
      agendaArticle.content.tasks = agendaArticle.content.tasks.filter(task => task.id != removeId)
    },
    moveAgendaTask(state, action) {
      const { articleId, taskIdToMove, toIndex } = action.payload
      const agendaArticle = state.entities[articleId]
      const oldIndex = agendaArticle.content.tasks.findIndex(t => t.id === taskIdToMove)
      const taskToMove = agendaArticle.content.tasks[oldIndex]
      agendaArticle.content.tasks.splice(oldIndex, 1)
      agendaArticle.content.tasks.splice(oldIndex < toIndex ? toIndex - 1 : toIndex, 0, taskToMove)
    },
    updateAgendaTask(state, action) {
      const { articleId, taskId, changedFields } = action.payload
      const agendaArticle = state.entities[articleId]
      const taskToUpdate = agendaArticle.content.tasks.find(task => task.id === taskId)
      Object.entries(changedFields).forEach(([field, value]) => taskToUpdate[field] = value)
    },
    addAgendaRestriction(state, action) {
      const { articleId, addIndex, newRestriction } = action.payload
      const agendaArticle = state.entities[articleId]
      agendaArticle.content.restrictions.splice(addIndex, 0, newRestriction)
    },
    removeAgendaRestriction(state, action) {
      const { articleId, removeId } = action.payload
      const agendaArticle = state.entities[articleId]
      agendaArticle.content.restrictions = agendaArticle.content.restrictions.filter(r => r.id != removeId)
    },
    moveAgendaRestriction(state, action) {
      const { articleId, restrictionIdToMove, toIndex } = action.payload
      const agendaArticle = state.entities[articleId]
      const oldIndex = agendaArticle.content.restrictions.findIndex(t => t.id === restrictionIdToMove)
      const toMove = agendaArticle.content.restrictions[oldIndex]
      agendaArticle.content.restrictions.splice(oldIndex, 1)
      agendaArticle.content.restrictions.splice(oldIndex < toIndex ? toIndex - 1 : toIndex, 0, toMove)
    },
    updateAgendaRestriction(state, action) {
      const { articleId, restrictionId, changedFields } = action.payload
      const agendaArticle = state.entities[articleId]
      const restrictionToUpdate = agendaArticle.content.restrictions.find(r => r.id === restrictionId)
      Object.entries(changedFields).forEach(([field, value]) => restrictionToUpdate[field] = value)
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
    'journalEntries/fetchEntries/fulfilled': (state, action) => {
      // Note that the payload here is formed in the async thunk in
      // Journal entries slice as that's where we first fondle the
      // fetched results.
      articlesAdapter.addMany(state, action.payload.articles.map(convertApiToFe))
    },
    'meta/changeFilter/fulfilled': (state, action) => {
      articlesAdapter.removeAll(state)
    },
  }
})

export function computeNextArticleId(state, forEntryId) {
  const existingIds = selectArticleIdsByEntryId(state, forEntryId)
  return (!existingIds || existingIds.length === 0)
    ? Number.parseInt(forEntryId + "001")
    : Math.max.apply(null, existingIds) + 1
}

export const {
  textUpdated,
  updateContent,
  addAgendaTask,
  removeAgendaTask,
  updateAgendaTask,
  moveAgendaTask,
  addAgendaRestriction,
  removeAgendaRestriction,
  moveAgendaRestriction,
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

// create a "selector creator" that uses lodash.isEqual instead of ===
const createDeepEqualSelector = createSelectorCreator(
  defaultMemoize,
  isEqual
)

export const makeSelectArticleIdsByEntryId = () => createDeepEqualSelector(
  [(state, entryId) => selectAllArticles(state).map(art => art.entryId == entryId ? art.id : null).filter(a => a)],
  (ids) => ids)

const selectArticleIdsByEntryId = makeSelectArticleIdsByEntryId()

export const makeSelectFilteredArticleIdsByEntryId = () =>
  createDeepEqualSelector(
    [(state, entryId) => selectArticleIdsByEntryId(state, entryId),
    (state, entryId) => selectFilteredKeys(state)],
    (articleIds, filteredKeys) => {
      if (filteredKeys === null) {
        return articleIds
      }
      const filteredArticleIds = new Set(filteredKeys.map(fk => Number.parseInt(fk.jaId)))
      return articleIds.filter(aid => filteredArticleIds.has(aid))
    })

export const makeSelectArticleKindsByIds = () => createDeepEqualSelector(
  [(state, articleIds) => selectArticlesByIds(state, articleIds).map(article => article ? article.kind : null)],
  (kinds) => kinds.filter(k => k)
)

export const selectArticleContentById = createSelector(
  [selectArticleById],
  (article) => article ? article.content : null
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

function extractRefTags(article, state) {
  const extractFromDraftContentState = contentState => {
    return contentState
      ? Object.values(contentState.entityMap).map(entity => entity.data.mention.name)
      : []
  }
  let refTags = []
  switch (article.kind) {
    case 'AGENDA':
      refTags = refTags.concat(extractFromDraftContentState(article.content.text))
      // TODO: the activity could be custom, not a refTag. I need to start recording the difference
      // and filtering here
      refTags = refTags.concat(article.content.tasks.map(task => task.activity.content))
      // TODO: the activities here could be custom and not a reftag. I need to start recording the
      // difference and filtering here
      refTags = refTags.concat(
        [].concat.apply([], article.content.restrictions.map(r => r.activities)))
      break;
    case 'VICE_LOG':
      const viceLog = selectViceLogById(state, article.content.logId) ?? {}
      refTags = refTags.concat(viceLog.vices)
      break;
    case 'VICE_LOG_V2':
      refTags = refTags.concat(article.content.vices)
    default:
      refTags = extractFromDraftContentState(article.content.text)
      break;
  }
  let tagSet = new Set()
  refTags.forEach(t => tagSet.add(t))
  return Array.from(tagSet)
}

function extractUserText(article, state) {
  var userTextBlocks = []
  switch (article.kind) {
    case 'AGENDA':
      userTextBlocks = userTextBlocks.concat(((article.content.text ?? {}).blocks ?? []).map(block => block.text))
      userTextBlocks = userTextBlocks.concat(article.content.tasks.map(task => (task.optNotes ?? "")))
      userTextBlocks = userTextBlocks.concat((article.content.restrictions ?? []).map(r => (r.optNote ?? "")))
      break;
    case 'VICE_LOG':
      // Race condition initial vice log article creation.
      const viceLog = selectViceLogById(state, article.content.logId) ?? {}
      userTextBlocks.push(viceLog.failureAnalysis)
      userTextBlocks.push(viceLog.impactAnalysis)
      userTextBlocks.push(viceLog.counterfactualAnalysis)
      userTextBlocks.push(viceLog.attonement)
      break;
    case 'VICE_LOG_V2':
      userTextBlocks.push(article.content.failureAnalysis)
      userTextBlocks.push(article.content.impactAnalysis)
      userTextBlocks.push(article.content.counterfactualAnalysis)
      userTextBlocks.push(article.content.attonement)
      break;
    default:
      userTextBlocks = userTextBlocks.concat((article.content.text.blocks ?? []).map(block => block.text))
      break;
  }
  return userTextBlocks.join(' ')
}

function getWordCount(article, state) {
  function countWords(s) {
    s = s.replace(/(^\s*)|(\s*$)/gi, "");//exclude  start and end white-space
    s = s.replace(/[ ]{2,}/gi, " ");//2 or more space to 1
    s = s.replace(/\n /, "\n"); // exclude newline with a start spacing
    return s.split(' ').filter(String).length;
  }
  const userText = extractUserText(article, state)
  return countWords(userText)
}

export const selectWordCount = createSelector(
  [selectArticlesByIds, (state, ids) => state],
  (articles, state) => articles.reduce((total, article) => total + getWordCount(article, state), 0)
)