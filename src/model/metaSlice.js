import {
  createSelector,
  createAsyncThunk,
  createSlice
} from '@reduxjs/toolkit'
import { API, graphqlOperation } from "aws-amplify"
import { searchFilteredJournalKeys } from '../graphql/customQueries'

export function convertDomainArticleFilterToApi(domainFilter) {
  if (domainFilter === null) {
    return {}
  }
  const apiFilter = {}
  const and = []
  if (domainFilter.searchText) {
    apiFilter.searchableText = { match: domainFilter.searchText }
  }
  if (domainFilter.minWordCount) {
    apiFilter.wordCount = { gte: domainFilter.minWordCount }
  }
  if (domainFilter.startDate) {
    and.push({ entryId: { gte: domainFilter.startDate } })
  }
  if (domainFilter.endDate) {
    and.push({ entryId: { lte: domainFilter.endDate } })
  }
  if (domainFilter.articleTypes && domainFilter.articleTypes.length > 0) {
    and.push(
      {
        or: domainFilter.articleTypes.map(at => { return { kind: { eq: at } } })
      }
    )
  }
  if (domainFilter.tagsReferenced && domainFilter.tagsReferenced.length > 0) {
    and.push(
      {
        // Might want to make this an 'AND' or possibly configurable by the user
        or: domainFilter.tagsReferenced.map(rt => { return { refTags: { match: rt } } })
      }
    )
  }
  if (and.length > 0) {
    apiFilter.and = and
  }
  return apiFilter
}

export const changeFilter = createAsyncThunk(
  'meta/changeFilter',
  async (payload, { getState }) => {
    const userId = selectFetchUserField(getState())
    const { newFilter } = payload
    if (newFilter === null) {
      return Promise.resolve(null)
    }
    const fetchParam = { userId, limit: 5000 }
    fetchParam.filter = convertDomainArticleFilterToApi(newFilter)
    
    if (Object.entries(fetchParam.filter).length === 0) {
      // Filter has been cleared, no reason to query.
      return Promise.resolve(null)
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

export const selectFilteredKeys = createSelector([(state) => state.meta.filteredKeys], f => f)