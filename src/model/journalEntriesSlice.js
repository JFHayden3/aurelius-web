import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  createSelector,
  compose
} from '@reduxjs/toolkit'
import { client } from '../api/client'
import { apiUrl } from '../kitchenSink'

const entriesAdapter = createEntityAdapter({
  sortComparer: (a, b) => {
    return b.date - a.date
  }
})

function convertApiToFe(items) {
  const entries = Array.map(items, (item) => JSON.parse(item.Entry))
  const articles = [].concat.apply([], Array.map(entries, (entry) => entry.articles))
  //const ids = Array.map(entries, (entry) => apiDateToFe(entry.date.toString()))
  //  Entry: "{"date":20200715,"articles":[{"id":11,"kind":"INTENTIONS","title":"Intentions","content":{"hint":"intentions hint","text":"intentions text"}},{"id":12,"kind":"REFLECTIONS","title":"Reflections","content":{"hint":"reflections hint","text":"reflections text"}}]}"
  const normalizedEntries = Array.map(entries, (entry) => {
    let articleIds = Array.map(entry.articles, (article) => article.id)
    return {
      id: entry.date,
      date: entry.date,
      dirtiness: 'CLEAN',
      articleIds: articleIds
    }
  })

  return {
    entities: normalizedEntries,
    articles: articles
  }
}

function convertFeEntriesToApi(entries, articlesDictionary) {
  return entries.map(entry => {
    const denormalizedArticles = entry.articleIds
      .map(articleId => articlesDictionary[articleId])
      .filter(article => article) // Excludes null entries (hanging references)
    return {
      date: entry.date,
      articles: denormalizedArticles
    }
  })
}

async function fetchJournalEntries(user, maxEndDate, maxNumEntries) {
  return client.get(
    apiUrl + '/journal'
    + '?userId=' + user + '&maxEndDate=' + maxEndDate + '&maxNumEntries=' + maxNumEntries + '')
    .then(response => {
      return convertApiToFe(response.Items)
    })
}

export const fetchEntries = createAsyncThunk(
  'journalEntries/fetchEntries',
  async (payload) => {
    return fetchJournalEntries(payload.user, payload.maxEndDate, payload.maxNumEntries)
  })

export const syncDirtyEntries = createAsyncThunk(
  'journalEntries/syncDirtyEntries',
  async (payload, { getState }) => {
    const dirtyEntries = selectByDirtiness(getState(), 'SAVING')
    if (dirtyEntries.length === 0) return Promise.resolve();
    async function syncEntity(apiJournalEntry) {
      const body = {
        userId: "testUser",
        entry: apiJournalEntry,
        httpMethod: "POST"
      }
      return client.post(apiUrl + '/journal', body)
    }
    let promises = convertFeEntriesToApi(dirtyEntries, getState().journalArticles.entities).map(syncEntity)
    return Promise.allSettled(promises)
  }
)

export function computeNextArticleId(state, forEntryId) {
  const entry = state.journalEntries.entities[forEntryId]
  return (!entry.articleIds || entry.articleIds.length === 0)
    ? Number.parseInt(forEntryId + "001")
    : Math.max.apply(null, entry.articleIds) + 1
}

const initialState = entriesAdapter.getInitialState()

export const journalEntriesSlice = createSlice({
  name: 'journalEntries',
  initialState,
  reducers: {
    createNewEntry(state, action) {
      const { dateId } = action.payload
      // check if the entry already exists for this date
      if (state.entities[dateId]) {
        console.log("\n\nATTEMPTED TO CREATE ENTITY THAT ALREADY EXISTS: " + dateId)
        return;
      }
      // TODO: figure out how best to do article creation and ID-uniqueness
      // Let's just do something dumb for now so I can start using this and iterating
      // interactively:
      // - Hardcoding 2 article IDs in here which will be picked up in a reducer
      // - in articlesSlice and will automatically create entries for refelections,
      // intetions, and agenda
      const newEntry = {
        id: dateId,
        date: dateId,
        dirtiness: 'DIRTY',
        articleIds: [],
      }
      entriesAdapter.upsertOne(state, newEntry)
    },
  },
  extraReducers: {
    [fetchEntries.fulfilled]: (state, action) => {
      entriesAdapter.setAll(state, action.payload.entities)
    },
    [syncDirtyEntries.pending]: (state, action) => {
      const entriesInFlight = Object.values(state.entities).filter((entry) => entry.dirtiness === 'DIRTY')
      entriesInFlight.forEach((entry) => entry.dirtiness = 'SAVING')
    },
    [syncDirtyEntries.fulfilled]: (state, action) => {
      const entriesInFlight = Object.values(state.entities).filter((entry) => entry.dirtiness === 'SAVING')
      // Only set the in-flight entries to 'CLEAN' so any changes made during
      // the request will be sent on the next fetch.
      entriesInFlight
        .filter((entry) => entry.dirtiness === 'SAVING')
        .forEach((entry) => entry.dirtiness = 'CLEAN')
    },
    [syncDirtyEntries.rejected]: (state, action) => {
      const entriesInFlight = Object.values(state.entities).filter((entry) => entry.dirtiness === 'SAVING')
      // TODO surface error, switch gui togle to manual rather than timed
      entriesInFlight
        .filter((entry) => entry.dirtiness === 'SAVING')
        .forEach((entry) => entry.dirtiness = 'DIRTY')
    },
    'journalArticles/addArticle': (state, action) => {
      const { entryId, articleId } = action.payload
      const entry = state.entities[entryId]
      entry.articleIds.push(articleId)
      entry.dirtiness = 'DIRTY'
    },
    'journalArticles/removeArticle': (state, action) => {
      const { articleId } = action.payload
      const entry = selectEntryByArticleId(state, articleId)
      entry.articleIds = entry.articleIds.filter(id => id != articleId)
      entry.dirtiness = 'DIRTY'
    },
    'journalArticles/textUpdated': makeDirtyByArticleId,
    'journalArticles/addAgendaTask': makeDirtyByArticleId,
    'journalArticles/removeAgendaTask': makeDirtyByArticleId,
    'journalArticles/updateAgendaTask': makeDirtyByArticleId,
    'journalArticles/addAgendaRestriction': makeDirtyByArticleId,
    'journalArticles/removeAgendaRestriction': makeDirtyByArticleId,
    'journalArticles/updateAgendaRestriction': makeDirtyByArticleId,
  },
})

function makeDirtyByArticleId(state, action) {
  const { articleId } = action.payload
  const dirtiedEntry = selectEntryByArticleId(state, articleId)
  dirtiedEntry.dirtiness = 'DIRTY'
}

function selectEntryByArticleId(state, articleId) {
  // PERFNOTE: This could be made much more efficient by creating a back reference
  // from article -> date/entry upon loading.
  return Object.values(state.entities).find(entry => entry.articleIds.includes(articleId))
}

export const { createNewEntry } = journalEntriesSlice.actions

export default journalEntriesSlice.reducer

// Export the customized selectors for this adapter using `getSelectors`
export const {
  selectAll: selectAllEntries,
  selectById: selectEntryById,
  selectIds: selectEntryIds,
  // Pass in a selector that returns the entries slice of state
} = entriesAdapter.getSelectors(state => state.journalEntries)

export const selectByDirtiness = createSelector(
  [selectAllEntries, (state, dirtiness) => dirtiness],
  (entries, dirtiness) => entries.filter((entry) => entry.dirtiness === dirtiness)
)

export const selectDirtyEntries = createSelector(
  [selectAllEntries, (state, dirtiness) => dirtiness],
  (entries) => entries.filter((entry) => entry.dirtiness === 'DIRTY')
)

export const selectArticleIdsForEntry = createSelector(
  [selectEntryById],
  (entry) => entry.articleIds)