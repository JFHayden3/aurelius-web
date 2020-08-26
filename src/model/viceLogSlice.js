import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice
} from '@reduxjs/toolkit'
import { apiUrl } from '../kitchenSink'
import { client } from '../api/client'

const dummyState = {
  1: {
    id: 1,
    date: 20200826,
    vices: ["youtube"],
    failureAnalysis: "Brought my phone into the bathroom with me and pulled up youtube without thinking",
    impactAnalysis: "Lost about an hour down a youtube hole and had a lot of trouble focusing for the rest of the afternoon",
    counterfactualAnalysis: "Could have left my phone out of the bathroom, would have been out and back to productive work in no time and spent the rest of the afternoon happily clickin away instead of constantly distracted.",
    attonement: "I'm removing the youtube app from my phone"
  },
}

const viceLogsAdapter = createEntityAdapter()

const initialState = viceLogsAdapter.getInitialState(
  { ids: Object.keys(dummyState).map(Number.parseInt), entities: dummyState })

export function computeNextViceLogId(state) {
  const existingIds = selectViceLogIds(state)
  return existingIds.length > 0 ? Math.max.apply(null, existingIds) + 1 : 0
}

export const viceLogSlice = createSlice({
  name: 'viceLogs',
  initialState,
  reducers: {
    updateViceLog(state, action) {

    },
  },
  extraReducers: {
  }
})

export const { updateViceLog } = viceLogSlice.actions

export default viceLogSlice.reducer

export const {
  selectAll: selectAllViceLogs,
  selectById: selectViceLogById,
  selectIds: selectViceLogIds
  // Pass in a selector that returns the posts slice of state
} = viceLogsAdapter.getSelectors(state => state.viceLogs)

export const selectViceLogsByVice = createSelector(
  [selectAllViceLogs, (state, refTag) => refTag],
  (allViceLogs, refTag) => allViceLogs.filter(vl => vl.vices.includes(refTag))
)
