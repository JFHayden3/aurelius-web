import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice
} from '@reduxjs/toolkit'
import { listViceLogs } from '../graphql/queries'
import { updateViceLog, createViceLog, deleteViceLog } from '../graphql/mutations'
import { API, graphqlOperation } from "aws-amplify"
import { selectFetchUserField } from './metaSlice'

const dummyState = {
  1: {
    id: 1,
    date: 20200826,
    vices: ["youtube"],
    failureAnalysis: "Brought my phone into the bathroom with me and pulled up youtube without thinking",
    impactAnalysis: "Lost about an hour down a youtube hole and had a lot of trouble focusing for the rest of the afternoon",
    counterfactualAnalysis: "Could have left my phone out of the bathroom, would have been out and back to productive work in no time and spent the rest of the afternoon happily clickin away instead of constantly distracted.",
    attonement: "I'm removing the youtube app from my phone",
    dirtiness: 'CLEAN'
  },
}

const viceLogsAdapter = createEntityAdapter()

const initialState = viceLogsAdapter.getInitialState()

export function computeNextViceLogId(state) {
  const existingIds = selectViceLogIds(state)
  return existingIds.length > 0 ? Math.max.apply(null, existingIds) + 1 : 0
}

function convertApiToFe(apiItems) {
  const logEntries = Array.map(apiItems, (item) => {
    const apiEntry = JSON.parse(item.log)
    return {
      // Explicit about the mapping here so we don't let gargbage in
      id: Number.parseInt(item.vlId),
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

function convertFeToApi(feItem, userId) {
  return {
    userId,
    vlId: feItem.id,
    // Explicit about the mapping here so we don't let gargbage in
    log: JSON.stringify({
      date: feItem.date,
      vices: feItem.vices,
      failureAnalysis: feItem.failureAnalysis,
      impactAnalysis: feItem.impactAnalysis,
      counterfactualAnalysis: feItem.counterfactualAnalysis,
      attonement: feItem.attonement,
    })
  }
}

export const fetchViceLogEntries = createAsyncThunk(
  'viceLogs/fetchLogEntries',
  async (payload, { getState }) => {
    const userId = selectFetchUserField(getState())
    return API.graphql(graphqlOperation(listViceLogs,
      {
        filter: {
          userId: { eq: userId },
        }
        , limit: 1000
      }))
      .then(response => {
        return convertApiToFe(response.data.listViceLogs.items)
      })
  })

export const syncDirtyViceLogEntries = createAsyncThunk(
  'viceLogs/syncDirtyViceLogEntries',
  async (payload, { getState }) => {
    const dirtyLogs = selectAllViceLogs(getState()).filter(entry => entry.dirtiness === 'SAVING')
    if (dirtyLogs.length === 0) return Promise.resolve();
    async function syncEntity(apiLogEntry) {
      const operation = graphqlOperation(updateViceLog,
        { input: apiLogEntry })

      return API.graphql(operation)
    }
    const userId = selectFetchUserField(getState())
    let promises = dirtyLogs.map(feEntry => convertFeToApi(feEntry, userId)).map(syncEntity)
    return Promise.allSettled(promises)
  }
)

export const deleteViceLogEntry = createAsyncThunk(
  'viceLogs/deleteViceLogEntry',
  async (payload, { getState }) => {
    const { logId } = payload
    const userId = selectFetchUserField(getState())
    const operation = graphqlOperation(deleteViceLog,
      {
        input: {
          userId,
          vlId: logId
        }
      })
    return API.graphql(operation).then(r => { return { logId } })
  }
)

export const createNewViceLogEntry = createAsyncThunk(
  'viceLogs/createNewViceLogEntry',
  async (payload, { getState }) => {
    const { id, vices, date } = payload
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
    const userId = selectFetchUserField(getState())
    const operation = graphqlOperation(createViceLog,
      {
        input: convertFeToApi(newViceLog, userId)
      })

    return API.graphql(operation).then(r => { return { newViceLog } })
  }
)

export const viceLogSlice = createSlice({
  name: 'viceLogs',
  initialState,
  reducers: {
    updateViceLogEntry(state, action) {
      const { id, changedFields } = action.payload
      const logEntry = state.entities[id]
      Object.entries(changedFields).forEach(([field, value]) => logEntry[field] = value)
      logEntry.dirtiness = 'DIRTY'
    },
  },
  extraReducers: {
    [createNewViceLogEntry.fulfilled]: (state, action) => {
      viceLogsAdapter.addOne(state, action.payload.newViceLog)
    },
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
      const { logId } = action.payload
      viceLogsAdapter.removeOne(state, logId)
    },
  }
})

export const { updateViceLogEntry } = viceLogSlice.actions

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
