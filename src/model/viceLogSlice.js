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
    attonement: "I'm removing the youtube app from my phone",
    dirtiness:'CLEAN'
  },
}

const viceLogsAdapter = createEntityAdapter()

const initialState = viceLogsAdapter.getInitialState(
  { ids: Object.keys(dummyState).map(Number.parseInt), entities: dummyState })

export function computeNextViceLogId(state) {
  const existingIds = selectViceLogIds(state)
  return existingIds.length > 0 ? Math.max.apply(null, existingIds) + 1 : 0
}

function convertApiToFe(apiItems) {
  const logEntries = Array.map(apiItems, (item) => {
    const apiEntry = JSON.parse(item.LogEntry)
    return {
      // Explicit about the mapping here so we don't let gargbage in
      id: apiEntry.id,
      date: apiEntry.date,
      vices: apiEntry.vices,
      failureAnalysis: apiEntry.failureAnalysis,
      impactAnalysis: apiEntry.impactAnalysis,
      counterfactualAnalysis: apiEntry.counterfactualAnalysis,
      attonement: apiEntry.attonement,
      dirtiness: 'CLEAN'
    }
  })

  return { entities: logEntries }
}

function convertFeToApi(feItem) {
  return {
    // Explicit about the mapping here so we don't let gargbage in
    id: feItem.id,
    date: feItem.date,
    vices: feItem.vices,
    failureAnalysis: feItem.failureAnalysis,
    impactAnalysis: feItem.impactAnalysis,
    counterfactualAnalysis: feItem.counterfactualAnalysis,
    attonement: feItem.attonement,
  }
}

export const fetchViceLogEntries = createAsyncThunk(
  'viceLogs/fetchLogEntries',
  async (payload) => {
    return client.get(
      apiUrl + '/vicelog' + '?userId=' + payload.user + '')
      .then(response => {
        return convertApiToFe(response.Items)
      })
  })

export const syncDirtyViceLogEntries = createAsyncThunk(
  'viceLogs/syncDirtyViceLogEntries',
  async (payload, { getState }) => {
    const dirtyLogs = selectAllViceLogs(getState()).filter(entry => entry.dirtiness === 'SAVING')
    if (dirtyLogs.length === 0) return Promise.resolve();
    async function syncEntity(apiLogEntry) {
      const body = {
        userId: "testUser",
        logEntry: apiLogEntry,
        httpMethod: "POST"
      }
      return client.post(apiUrl + '/vicelog', body)
    }
    let promises = dirtyLogs.map(feEntry => convertFeToApi(feEntry)).map(syncEntity)
    return Promise.allSettled(promises)
  }
)

export const deleteViceLog = createAsyncThunk(
  'viceLogs/deleteViceLog',
  async (payload) => {
    return client.delete(
      apiUrl + '/vicelog' + '?userId=testUser' + '&logId=' + payload.logId + '')
  }
)

export const viceLogSlice = createSlice({
  name: 'viceLogs',
  initialState,
  reducers: {
    createNewViceLogEntry(state, action) {
      const { id, vices, date } = action.payload
      const newViceLog = {
        id,
        date,
        vices,
        failureAnalysis: "",
        impactAnalysis: "",
        counterfactualAnalysis: "",
        attonement: "",
        dirtiness: 'CLEAN'
      }
      viceLogsAdapter.upsertOne(state, newViceLog)
    },
    updateViceLog(state, action) {
      const { id, changedFields } = action.payload
      const logEntry = state.entities[id]
      Object.entries(changedFields).forEach(([field, value]) => logEntry[field] = value)
      logEntry.dirtiness = 'DIRTY'
    },
  },
  extraReducers: {
    [fetchViceLogEntries.fulfilled]: (state, action) => {
      viceLogsAdapter.setAll(state, action.payload.entities)
    },
    [syncDirtyViceLogEntries.pending]: (state, action) => {
      const logsInFlight = Object.values(state.entities).filter((entry) => entry.dirtiness === 'DIRTY')
      logsInFlight.forEach((entry) => entry.dirtiness = 'SAVING')
    },
    [syncDirtyViceLogEntries.fulfilled]: (state, action) => {
      const logsInFlight = Object.values(state.entities).filter((entry) => entry.dirtiness === 'SAVING')
      // Only set the in-flight entries to 'CLEAN' so any changes made during
      // the request will be sent on the next fetch.
      logsInFlight
        .filter((entry) => entry.dirtiness === 'SAVING')
        .forEach((entry) => entry.dirtiness = 'CLEAN')
    },
    [syncDirtyViceLogEntries.rejected]: (state, action) => {
      const logsInFlight = Object.values(state.entities).filter((entry) => entry.dirtiness === 'SAVING')
      // TODO surface error, switch gui togle to manual rather than timed
      logsInFlight
        .filter((entry) => entry.dirtiness === 'SAVING')
        .forEach((entry) => entry.dirtiness = 'DIRTY')
    },
    [deleteViceLog.fulfilled]: (state, action) => {
      viceLogsAdapter.removeOne(state, action.meta.arg.logId)
    },
  }
})

export const { createNewViceLogEntry, updateViceLog } = viceLogSlice.actions

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
