import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import { defaultMemoize, createSelectorCreator } from 'reselect'
import { API, graphqlOperation } from "aws-amplify"
import { selectFetchUserField, selectFilteredKeys, convertDomainArticleFilterToApi } from './metaSlice'
import { createJournalArticle, deleteJournalArticle } from '../graphql/mutations'
import { searchJournalArticles } from '../graphql/queries'
import { isEqual, orderBy } from 'lodash'
import { apiDateToFe, prettyPrintDuration, prettyPrintTime, RestrictionConversion } from '../kitchenSink'
import { Storage } from 'aws-amplify'

const articlesAdapter = createEntityAdapter({
  sortComparer: (a, b) => a.id - b.id
})

const initialState = articlesAdapter.getInitialState({ filterCache: {} })

export function convertFeToApiArticle(feArticle, userId) {
  return {
    userId
    , jaId: feArticle.id
    , entryId: feArticle.entryId
    , kind: feArticle.kind
    , content: JSON.stringify({ title: feArticle.title, content: feArticle.content })
    , searchableText: extractUserText(feArticle)
    , refTags: extractRefTags(feArticle)
    , wordCount: getWordCount(feArticle)
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
  }
}

export const downloadArticles = createAsyncThunk(
  'journalArticles/downloadArticles',
  async (payload, { getState }) => {
    // TODO: URL cache
    const { downloadFilter } = payload

    const userId = selectFetchUserField(getState())
    const fetchParam = { userId, limit: 5000 }

    const filterParam = convertDomainArticleFilterToApi(downloadFilter)
    if (Object.entries(filterParam).length > 0) {
      fetchParam.filter = filterParam
    }
    return API.graphql(graphqlOperation(searchJournalArticles, fetchParam))
      .then(response => response.data.searchJournalArticles.items.map(convertApiToFe))
      .then(res => {
        const strs = []
        var currentEntryId = ""
        orderBy(res, res => res.entryId + ' ' + res.id, 'asc').forEach(article => {
          if (article.entryId !== currentEntryId) {
            strs.push('-- ' + apiDateToFe(article.entryId) + ' --')
            currentEntryId = article.entryId
          }

          strs.push('[' + article.title + ']')
          switch (article.kind) {
            case 'AGENDA':
              strs.push(extractTextFromBlocks(article.content.text).join(' '))
              strs.push('\t- Agenda:')
              article.content.tasks.forEach(task => {
                const { activity, optDuration, optTime, optNotes } = task
                const prettyTime = prettyPrintTime(optTime)
                const timeStr = prettyTime ? prettyTime + ": " : ""
                const activityStr = activity && activity.content ? activity.content : ""
                const durationStr = prettyPrintDuration(optDuration)
                strs.push('\t * ' + timeStr + activityStr + ' ' + durationStr)
                if (optNotes) {
                  strs.push('\t\t - ' + optNotes)
                }
              })
              strs.push('\t- Restrictions:')
              article.content.restrictions.forEach(r => {
                const { activities, optNote, restriction } = r
                const restrictionStr = RestrictionConversion.prettyPrintRestriction(
                  RestrictionConversion.convertModelToPresentation(restriction))
                const activitiesStr = activities.join(', ')
                strs.push('\t * ' + activitiesStr + ': ' + restrictionStr)
                if (optNote) {
                  strs.push('\t\t\ - ' + optNote)
                }
              })
              break;
            case 'VICE_LOG_V2':
              strs.push('- Behavior(s): ' + article.content.vices.join(', '))
              strs.push('- Failure analysis:')
              strs.push(article.content.failureAnalysis)
              strs.push('- Impact analysis:')
              strs.push(article.content.impactAnalysis)
              strs.push('- Counterfactual analysis:')
              strs.push(article.content.counterfactualAnalysis)
              strs.push('- Atonement plan:')
              strs.push(article.content.attonement)
              break;
            default:
              strs.push(extractUserText(article))
              break;
          }
          strs.push('')
        })
        const storageKey = 'export - ' + Date.now()
        return Storage.vault.put(storageKey, strs.join('\n'), {
          level: 'private',
          contentType: 'text/plain'
        }).then(storeRes =>
          Storage.vault.get(storageKey, { level: 'private', expires: 600 })
            .then(link => {
              return { link, fileName: storageKey }
            })
        )
      })
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
    }
    const state = getState()
    const userId = selectFetchUserField(state)
    const operation = graphqlOperation(createJournalArticle,
      {
        input: convertFeToApiArticle(newArticle, userId, state),
      })
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

function filterToCacheKey(filter) {
  return JSON.stringify(filter)
}

export const fetchFilteredArticles = createAsyncThunk(
  'journalArticles/fetchFilteredArticles',
  async (payload, { getState }) => {
    const { filter } = payload
    // TODO: This is an error. Probably shouldn't handle like this
    if (!filter) {
      return []
    }
    const filterAsStr = filterToCacheKey(filter)
    const state = getState()
    const cacheEntry = state.journalArticles.filterCache[filterAsStr]
    if (!cacheEntry || cacheEntry === 'LOADING') {
      // Nothing in the cache, fetch the full articles matching the filter, and in
      // the '.fufilled', insert the jaIds into the cache and the converted articles
      // into the entity adapter
      const userId = selectFetchUserField(getState())
      const fetchParam = { userId, limit: 5000 }
      fetchParam.filter = convertDomainArticleFilterToApi(filter)

      if (Object.entries(fetchParam.filter).length === 0) {
        // Filter has been cleared, no reason to query.
        return Promise.resolve(null)
      }
      return API.graphql(graphqlOperation(searchJournalArticles,
        fetchParam))
        .then(response => {
          return {
            cacheKey: filterAsStr,
            items: response.data.searchJournalArticles.items.map(convertApiToFe)
          }
        })
    } else {
      // Should have cached keys (article IDs) here, can look up articles directly in the
      // entity adapater and return them without fetching.
      // TODO validate and log nulls as that could only happen if something went wrong (or if I deleted
      // the article)
      return Promise.resolve(
        {
          cacheKey: filterAsStr,
          items: cacheEntry.map(jaId => state.journalArticles.entities[jaId])
        })
    }
  }
)

// Filter cache Qs:
// Do I make the filter cache part of this slice, metaSlice, or a new slice?
// - This slice has a lot going on already... However on fetch complete I'm going to need to
// take the results and shove them in the articles entity adapter one way or another. Doing
// it here prevents the need for more awkward cross-slice listening...
// Let's just do it here for now. I can refactor easily enough later.
// How to hash the filter by val?

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
    },
  },
  extraReducers: {
    [fetchFilteredArticles.pending]: (state, action) => {
      const { filter } = action.meta.arg
      const cacheKey = filterToCacheKey(filter)
      if (!state.filterCache[cacheKey]) {
        state.filterCache[cacheKey] = 'LOADING'
      }
    },
    [fetchFilteredArticles.fulfilled]: (state, action) => {
      const { cacheKey, items } = action.payload
      state.filterCache[cacheKey] = items.map(art => art.id)
      articlesAdapter.upsertMany(state, items)
    },
    [removeArticle.fulfilled]: (state, action) => {
      const { articleId } = action.payload
      articlesAdapter.removeOne(state, articleId)
      doInvalidateFilterCache(state)
    },
    [addArticle.fulfilled]: (state, action) => {
      articlesAdapter.addOne(state, action.payload.newArticle)
      doInvalidateFilterCache(state)
    },
    'journalEntries/fetchEntries/fulfilled': (state, action) => {
      // Note that the payload here is formed in the async thunk in
      // Journal entries slice as that's where we first fondle the
      // fetched results.
      articlesAdapter.upsertMany(state, action.payload.articles.map(convertApiToFe))
    },
  }
})

function doInvalidateFilterCache(state) {
  state.filterCache = {}
}

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
    return articleIds && Array.isArray(articleIds) ?
      articleIds.map(id => state.journalArticles.entities[id])
      : []
  }

// create a "selector creator" that uses lodash.isEqual instead of ===
const createDeepEqualSelector = createSelectorCreator(
  defaultMemoize,
  isEqual
)

export const makeSelectArticleDatesByIds = () => createDeepEqualSelector(
  [(state, articleIds) => selectArticlesByIds(state, articleIds).map(
    art => {
      switch (art.kind) {
        case 'VICE_LOG_V2':
          return art.content.date
        default:
          return art.entryId
      }
    })],
  dates => dates
)

export const makeSelectArticleIdsByFilter = () => createDeepEqualSelector(
  [(state, filter) => state.journalArticles.filterCache[filterToCacheKey(filter)]],
  ids => ids)

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

function extractRefTags(article) {
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
    case 'VICE_LOG_V2':
      refTags = refTags.concat(article.content.vices)
      break;
    default:
      refTags = extractFromDraftContentState(article.content.text)
      break;
  }
  let tagSet = new Set()
  refTags.forEach(t => tagSet.add(t))
  return Array.from(tagSet)
}

function extractTextFromBlocks(textBlock) {
  return ((textBlock ?? {}).blocks ?? []).map(block => block.text)
}

function extractUserText(article) {
  var userTextBlocks = []
  switch (article.kind) {
    case 'AGENDA':
      userTextBlocks = userTextBlocks.concat(extractTextFromBlocks(article.content.text))
      userTextBlocks = userTextBlocks.concat(article.content.tasks.map(task => (task.optNotes ?? "")))
      userTextBlocks = userTextBlocks.concat((article.content.restrictions ?? []).map(r => (r.optNote ?? "")))
      break;
    case 'VICE_LOG_V2':
      userTextBlocks.push(article.content.failureAnalysis)
      userTextBlocks.push(article.content.impactAnalysis)
      userTextBlocks.push(article.content.counterfactualAnalysis)
      userTextBlocks.push(article.content.attonement)
      break;
    default:
      userTextBlocks = userTextBlocks.concat(extractTextFromBlocks(article.content.text))
      break;
  }
  return userTextBlocks.join(' ')
}

function getWordCount(article) {
  function countWords(s) {
    s = s.replace(/(^\s*)|(\s*$)/gi, "");//exclude  start and end white-space
    s = s.replace(/[ ]{2,}/gi, " ");//2 or more space to 1
    s = s.replace(/\n /, "\n"); // exclude newline with a start spacing
    return s.split(' ').filter(String).length;
  }
  const userText = extractUserText(article)
  return countWords(userText)
}

export const selectWordCount = createSelector(
  [selectArticlesByIds],
  (articles) => articles.reduce((total, article) => total + getWordCount(article), 0)
)