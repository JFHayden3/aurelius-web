import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  createSelector,
} from '@reduxjs/toolkit'
import { selectFetchUserField, selectFilteredKeys } from './metaSlice'
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
    return {
      id: entry.jeId,
      date: entry.jeId,
      dirtiness: 'CLEAN',
    }
  })

  return {
    entities: normalizedEntries,
    articles: articles
  }
}

export const fetchEntries = createAsyncThunk(
  'journalEntries/fetchEntries',
  async (payload, { getState }) => {
    const state = getState()
    const userId = selectFetchUserField(state)
    const allKeys = selectAllKeys(state)
    // Initial fetch. This is a shit way of handling things
    // TODO: make less shit
    if (allKeys.length === 0) {
      return API.graphql(graphqlOperation(listJournalEntrys,
        {
          userId: userId,
          jeId: { le: payload.maxEndDate, },
          limit: payload.maxNumEntries,
          sortDirection: "DESC"
        }))
        .then(response => {
          return convertApiToFe(response.data.listJournalEntrys.items)
        })
    }

    const effectiveKeys = selectEffectiveKeys(state)
    const keyIndex = payload.maxEndDate
      ? effectiveKeys.findIndex(k => k == payload.maxEndDate)
      : effectiveKeys.length - 1
    const toFetch = effectiveKeys.slice(Math.max(0, keyIndex - payload.maxNumEntries), keyIndex + 1)
    return API.graphql(graphqlOperation(listJournalEntrys,
      {
        userId: userId,
        // TODO(maybe): add a 'between' filter on jeId here to potentially narrow the scanned range
        filter: {
          or: toFetch.map(key => { return { jeIdAgain: { eq: Number.parseInt(key) } } }),
        },
        // This is the scanned limit not the actual limit that is returned. We guarantee that we
        // return the right number of elements because of the slicing of the keys to only the number
        // that were requested.
        limit: 10000, 
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
        userId: userId
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
    }
    const userId = selectFetchUserField(getState())
    const jeId = Number.parseInt(newEntry.id)
    const operation = graphqlOperation(createJournalEntry,
      {
        input:
        {
          userId
          , jeId
          , jeIdAgain: jeId
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
    'meta/changeFilter/fulfilled': (state, action) => {
      entriesAdapter.removeAll(state)
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
  [selectEntryIds, state => selectEffectiveKeys(state)],
  (fetchedEntryIds, effectiveKeys) => {
    const fetched = new Set(fetchedEntryIds)
    return !(effectiveKeys.every(key => fetched.has(key)))
  }
)

const selectEffectiveKeys = state => {
  const allKeys = selectAllKeys(state)
  const filteredKeys = selectFilteredKeys(state)
  const effectiveKeys = filteredKeys != null ?
    Array.from(new Set(filteredKeys.map(fk => fk.entryId)))
    : allKeys
  return effectiveKeys
}

const selectAllKeys = state => state.journalEntries ? state.journalEntries.allKeys : []

export const selectEntriesLoading = (state) => state.journalEntries.entriesLoading
