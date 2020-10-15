import {
  createSelector,
  createAsyncThunk,
  createSlice
} from '@reduxjs/toolkit'
import { API, graphqlOperation } from "aws-amplify"
import { listFilteredJournalKeys } from '../graphql/customQueries'
import { fetchEntries } from './journalEntriesSlice'

export const changeFilter = createAsyncThunk(
  'meta/changeFilter',
  async (payload, { getState }) => {
    const userId = selectFetchUserField(getState())
    const { newFilter } = payload
    if (newFilter === null) {
      return Promise.resolve(null)
    }
    const fetchParam = { userId, limit: 5000 }
    fetchParam.filter = { }
    const and = []
    if (newFilter.minWordCount) {
      fetchParam.filter.wordCount = { ge: newFilter.minWordCount }
    }
    if (newFilter.startDate && newFilter.endDate) {
      fetchParam.filter.entryId = {
        between: [newFilter.startDate, newFilter.endDate]
      }
    }
    if (newFilter.articleTypes && newFilter.articleTypes.length > 0) {
      and.push(
        {
          or: newFilter.articleTypes.map(at => { return { kind: { eq: at } } })
        }
      )
    }
    if (newFilter.tagsReferenced && newFilter.tagsReferenced.length > 0) {
      and.push(
        {
          or: newFilter.tagsReferenced.map(rt => { return { refTags: { contains: rt } } })
        }
      )
    }
    if (and.length > 0) {
      newFilter.filter.and = and
    }
    return API.graphql(graphqlOperation(listFilteredJournalKeys,
      fetchParam))
      .then(response => {
        return response.data.listJournalArticles.items
      })
  })

export const metaSlice = createSlice({
  name: 'meta',
  initialState: { initializationState: 'UNINITIALIZED', authUser: null, filter: null, filteredKeys: null },
  reducers: {
    setInitialized(state, action) {
      state.initializationState = 'INITIALIZED'
    },
    setAuthUser(state, action) {
      const { authUser } = action.payload
      state.authUser = authUser
    }
  },
  extraReducers: {
    [changeFilter.pending]: (state, action) => {
      state.filteredKeys = null
      state.filter = action.meta.arg.newFilter
    },
    [changeFilter.fulfilled]: (state, action) => {
      state.filteredKeys = action.payload
    },
  },
})

export const {
  setInitialized,
  setAuthUser,
} = metaSlice.actions

export default metaSlice.reducer

export const selectIsInitializationComplete =
  (state) => state.meta.initializationState === 'INITIALIZED'

export const selectAuthUser = (state) => state.meta.authUser

export const selectFetchUserField = (state) => state.meta.authUser.sub

export const selectFilter = (state) => state.meta.filter

export const selectFilteredKeys = (state) => state.meta.filteredKeys