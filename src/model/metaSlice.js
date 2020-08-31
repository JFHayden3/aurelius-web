import {
  createSelector,
  createSlice
} from '@reduxjs/toolkit'

export const metaSlice = createSlice({
  name: 'meta',
  initialState: { initializationState: 'UNINITIALIZED' },
  reducers: {
    setInitialized(state, action) {
      state.initializationState = 'INITIALIZED'
    },
  },
  extraReducers: {
  },
})

export const {
  setInitialized,
} = metaSlice.actions

export default metaSlice.reducer

export const selectIsInitializationComplete =
  (state) => state.meta.initializationState === 'INITIALIZED'
