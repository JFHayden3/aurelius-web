import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  createSelector,
} from '@reduxjs/toolkit'

import { selectFetchUserField } from './metaSlice'
import { listJournalEntrys, listJournalEntryKeys } from '../graphql/customQueries'
import { createJournalEntry } from '../graphql/customMutations'
import { API, graphqlOperation } from "aws-amplify"

const entriesAdapter = createEntityAdapter({
  sortComparer: (a, b) => {
    return b.date - a.date
  }
})

function convertApiToFe(entries) {
  const articles = [].concat.apply([], Array.map(entries, (entry) => entry.articles.items))
  //const ids = Array.map(entries, (entry) => apiDateToFe(entry.date.toString()))
  //  Entry: "{"date":20200715,"articles":[{"id":11,"kind":"INTENTIONS","title":"Intentions","content":{"hint":"intentions hint","text":"intentions text"}},{"id":12,"kind":"REFLECTIONS","title":"Reflections","content":{"hint":"reflections hint","text":"reflections text"}}]}"
  const normalizedEntries = Array.map(entries, (entry) => {
    let articleIds = Array.map(entry.articles, (article) => article.id)
    return {
      id: entry.jeId,
      date: entry.jeId,
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

export const fetchEntries = createAsyncThunk(
  'journalEntries/fetchEntries',
  async (payload, { getState }) => {
    const userId = selectFetchUserField(getState())
    return API.graphql(graphqlOperation(listJournalEntrys,
      {
        filter: {
          userId: { eq: userId },
          and: [
            {
              or: [
                { jeId: { lt: payload.maxEndDate } },
                { jeId: { eq: payload.maxEndDate } }
              ]
            }
          ]
        }
        , limit: payload.maxNumEntries
        , sort: "DESC"
      }))
      .then(response => {
        return convertApiToFe(response.data.listJournalEntrys.items)
      })
  })

export const fetchAllKeys = createAsyncThunk(
  'journalEntries/fetchAllKeys',
  async (payload, { getState }) => {
    const userId = selectFetchUserField(getState())
    return API.graphql(graphqlOperation(listJournalEntryKeys,
      {
        filter: {
          userId: { eq: userId },
        }
        , limit: 10000
      }))
      .then(res => {
        return res.data.listJournalEntrys.items.map(item => item.jeId)
      })
  }
)

export const createNewEntry = createAsyncThunk(
  'journalEntries/createNewEntry',
  async (payload, { getState }) => {
    const { dateId } = payload
    // check if the entry already exists for this date
    if (getState().journalEntries.entities[dateId]) {
      console.log("\n\nATTEMPTED TO CREATE ENTRY THAT ALREADY EXISTS: " + dateId)
      return;
    }
    const newEntry = {
      id: dateId,
      date: dateId,
      dirtiness: 'DIRTY',
      articleIds: [],
    }
    const userId = selectFetchUserField(getState())
    const operation = graphqlOperation(createJournalEntry,
      {
        input:
        {
          userId
          , jeId: Number.parseInt(newEntry.id)
        },
      })
    return API.graphql(operation).then(r => { return { newEntry } })
  }
)


const initialState = entriesAdapter.getInitialState({
  entriesLoading: false,
  allKeys: []
})

export const journalEntriesSlice = createSlice({
  name: 'journalEntries',
  initialState,
  reducers: {

  },
  extraReducers: {
    [createNewEntry.fulfilled]: (state, action) => {
      entriesAdapter.addOne(state, action.payload.newEntry)
    },
    [fetchEntries.pending]: (state, action) => {
      state.entriesLoading = true
    },
    [fetchEntries.fulfilled]: (state, action) => {
      state.entriesLoading = false
      entriesAdapter.upsertMany(state, action.payload.entities)
    },
    [fetchAllKeys.fulfilled]: (state, action) => {
      state.allKeys = action.payload
    },
  },
})

export const { } = journalEntriesSlice.actions

export default journalEntriesSlice.reducer

// Export the customized selectors for this adapter using `getSelectors`
export const {
  selectAll: selectAllEntries,
  selectById: selectEntryById,
  selectIds: selectEntryIds,
  // Pass in a selector that returns the entries slice of state
} = entriesAdapter.getSelectors(state => state.journalEntries)

export const selectUnfetchedEntriesExist = createSelector(
  [selectEntryIds, (state) => state.journalEntries.allKeys],
  (fetchedEntryIds, allKeys) => {
    const fetched = new Set(fetchedEntryIds)
    return !(allKeys.every(key => fetched.has(key)))
  }
)

export const selectEntriesLoading = (state) => state.journalEntries.entriesLoading

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