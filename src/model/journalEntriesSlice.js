import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  createSelector,
  compose
} from '@reduxjs/toolkit'
import { client } from '../api/client'

const entriesAdapter = createEntityAdapter({
  sortComparer: (a, b) => {
    return b.date - a.date
  }
})


// SHOULDN'T be necessary and adds additional danger of forgetting/inconsistent conversion.
// Will try to just work with the yyyyMMdd numerical format until presentation
//function apiDateToFe(str) {
//  if (!/^(\d){8}$/.test(str)) {
//    console.log("invalid date")
//    return NaN
//  }
//  var y = str.substr(0, 4),
//    m = str.substr(4, 2),
//    d = str.substr(6, 2);
//  let foo = Date.parse(y + "-" + m + "-" + d)
//  return foo;
//}
//
//function feDateToApi(dNum) {
//  const date = new Date(dNum)
//  return Number.parseInt("" + date.getFullYear() + (date.getMonth() + 1) + date.getDate())
//}

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
    'https://mjsjd63379.execute-api.us-east-1.amazonaws.com/dev/journal'
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
    const dirtyEntryIds = payload.dirtyEntryIds
    const dirtyEntries = dirtyEntryIds.map((id) => selectEntryById(getState(), id))
    if (dirtyEntries.length === 0) return Promise.resolve();
    async function syncEntity(apiJournalEntry) {
      const body = {
        userId: "testUser",
        entry: apiJournalEntry,
        httpMethod: "POST"
      }
      return client.post(
        'https://mjsjd63379.execute-api.us-east-1.amazonaws.com/dev/journal', body)
    }
    let promises = convertFeEntriesToApi(dirtyEntries, getState().journalArticles.entities).map(syncEntity)
    return Promise.allSettled(promises)
  }
)

const initialState = entriesAdapter.getInitialState()
export function computeNextArticleId(state, forEntryId) {
  const entry = state.journalEntries.entities[forEntryId]
  return (!entry.articleIds || entry.articleIds.length === 0) 
    ? Number.parseInt(forEntryId + "01")
    : Math.max.apply(null, entry.articleIds) + 1
}

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
      const entryIdsInFlight = action.meta.arg.dirtyEntryIds
      const entriesInFlight = entryIdsInFlight.map((id) => state.entities[id])
      entriesInFlight.forEach((entry) => entry.dirtiness = 'SAVING')
    },
    [syncDirtyEntries.fulfilled]: (state, action) => {
      const entryIdsInFlight = action.meta.arg.dirtyEntryIds
      const entriesInFlight = entryIdsInFlight.map((id) => state.entities[id])
      // Only set the in-flight entries to 'CLEAN' so any changes made during
      // the request will be sent on the next fetch.
      entriesInFlight
        .filter((entry) => entry.dirtiness === 'SAVING')
        .forEach((entry) => entry.dirtiness = 'CLEAN')
    },
    [syncDirtyEntries.rejected]: (state, action) => {
      const entryIdsInFlight = action.meta.arg.dirtyEntryIds
      const entriesInFlight = entryIdsInFlight.map((id) => state.entities[id])
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
    'journalArticles/textUpdated': (state, action) => {
      const { articleId } = action.payload
      const dirtiedEntry = selectEntryByArticleId(state, articleId)
      dirtiedEntry.dirtiness = 'DIRTY'
    }
  },
})

function selectEntryByArticleId(state, articleId) {
  // PERFNOTE: This could be made much more efficient by creating a back reference
  // from article -> date/entry upon loading.
  return Object.values(state.entities).find(entry => entry.articleIds.includes(articleId))
}

export function dispatchSyncDirtyEntitiesWithDelay() {
  return function (dispatch, getState) {
    setTimeout(() => {
      const dirtyEntryIds = selectDirtyEntries(getState()).map(entry => entry.date)
      dispatch(syncDirtyEntries({ dirtyEntryIds: dirtyEntryIds }))
    }, 2500)
  }
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