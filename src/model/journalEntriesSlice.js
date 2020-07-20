import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice
} from '@reduxjs/toolkit'
import { client } from '../api/client'

const entriesAdapter = createEntityAdapter({
  sortComparer: (a, b) => {
    if (b.date < a.date) {
      return -1
    } else if (b.date > a.date) {
      return 1
    } else {
      return 0
    }
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
      isDirty: false,
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
     const denormalizedArticles = entry.articleIds.map(articleId => articlesDictionary[articleId])
     return { date: entry.date,
              articles: denormalizedArticles
            }
  })
}

export const fetchEntries = createAsyncThunk(
  'journalEntries/fetchEntries',
  async (payload) => {
    const response = await client.get(
      'https://mjsjd63379.execute-api.us-east-1.amazonaws.com/dev/journal'
      + '?userId=testUser&maxEndDate=' + payload.maxEndDate + '&maxNumEntries=' + payload.maxNumEntries + '');
    return convertApiToFe(response.Items)
  })

export const syncDirtyEntries = createAsyncThunk(
  'journalEntries/syncDirtyEntries',
  async (payload, { getState }) => {
    const dirtyEntries = selectAllEntries(getState()).filter(entry => entry.isDirty)
    console.log(dirtyEntries.length)
    if (dirtyEntries.length === 0) return Promise.resolve();
    async function syncEntity(entity) {
      // TODO fire off the event here
      // ALSO: on the pending of this, set the dirty flag to 'SAVING'.
      // going to change dirty to be 'CLEAN, DIRTY, or 'SAVING' so we can
      // keep track of dirty changes made after a sync was already in flight
      console.log(JSON.stringify(entity))
      Promise.resolve(1)
    }
    let promises = convertFeEntriesToApi(dirtyEntries, getState().journalArticles.entities).map(syncEntity)
    Promise.all(promises)
    console.log("all done")
  }
)

const initialState = entriesAdapter.getInitialState()

export const journalEntriesSlice = createSlice({
  name: 'journalEntries',
  initialState,
  reducers: {

  },
  extraReducers: {
    [fetchEntries.fulfilled]: (state, action) => {
      entriesAdapter.setAll(state, action.payload.entities)
    },
    [syncDirtyEntries.pending]: (state, action) => {
    },
    'journalArticles/textUpdated': (state, action) => {
      // PERFNOTE: This could be made much more efficient by creating a back reference
      // from article -> date/entry upon loading.
      const { articleId } = action.payload
      const dirtiedEntry = Object.values(state.entities).find(entry => entry.articleIds.includes(articleId))
      dirtiedEntry.isDirty = true
    }
  },
})

//export const { syncDirtyEntries } = journalEntriesSlice.actions

export default journalEntriesSlice.reducer

// Export the customized selectors for this adapter using `getSelectors`
export const {
  selectAll: selectAllEntries,
  selectById: selectEntryById,
  selectIds: selectEntryIds,
  // Pass in a selector that returns the entries slice of state
} = entriesAdapter.getSelectors(state => state.journalEntries)