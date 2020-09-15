import {
  createSelector,
  createSlice
} from '@reduxjs/toolkit'

export const metaSlice = createSlice({
  name: 'meta',
  initialState: { initializationState: 'UNINITIALIZED', authUser: null },
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