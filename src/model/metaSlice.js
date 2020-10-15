import {
  createSelector,
  createAsyncThunk,
  createSlice
} from '@reduxjs/toolkit'
import { API, graphqlOperation } from "aws-amplify"
import { searchFilteredJournalKeys } from '../graphql/customQueries'

export const changeFilter = createAsyncThunk(
  'meta/changeFilter',
  async (payload, { getState }) => {
    const userId = selectFetchUserField(getState())
    const { newFilter } = payload
    if (newFilter === null) {
      return Promise.resolve(null)
    }
    const fetchParam = { userId, limit: 5000 }
    fetchParam.filter = {}
    const and = []
    if (newFilter.searchText) {
      fetchParam.filter.searchableText = { match: newFilter.searchText }
    }
    if (newFilter.minWordCount) {
      fetchParam.filter.wordCount = { gte: newFilter.minWordCount }
    }
    if (newFilter.startDate) {
      and.push({ entryId: { gte: newFilter.startDate } })
    }
    if (newFilter.endDate) {
      and.push({ entryId: { lte: newFilter.endDate } })
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
          // Might want to make this an 'AND' or possibly configurable by the user
          or: newFilter.tagsReferenced.map(rt => { return { refTags: { match: rt } } })
        }
      )
    }
    if (and.length > 0) {
      fetchParam.filter.and = and
    }
    return API.graphql(graphqlOperation(searchFilteredJournalKeys,
      fetchParam))
      .then(response => {
        return response.data.searchJournalArticles.items
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