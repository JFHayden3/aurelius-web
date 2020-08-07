import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice
} from '@reduxjs/toolkit'
import { apiUrl } from '../kitchenSink'
import { client } from '../api/client'

const vicesAdapter = createEntityAdapter()

const initialState = vicesAdapter.getInitialState()

export function computeNextViceId(state) {
  const existingIds = selectViceIds(state)
  return existingIds.length > 0 ? Math.max.apply(null, existingIds) + 1 : 0
}

function convertApiToFe(apiItems) {
  const vices = Array.map(apiItems, (item) => {
    const apiVice = JSON.parse(item.Vice)
    return {
      // Explicit about the mapping here so we don't let gargbage in
      id: apiVice.id,
      name: apiVice.name,
      refTag: apiVice.refTag,
      description: apiVice.description,
      defaultEngagementRestriction: apiVice.defaultEngagementRestriction,
      negativeImpactDescription: apiVice.negativeImpactDescription,
      seductionDescription: apiVice.seductionDescription,
      mitigationTactics: apiVice.mitigationTactics,
      dirtiness: 'CLEAN'
    }
  })

  return { entities: vices }
}

function convertFeToApi(feItem) {
  return {
    // Explicit about the mapping here so we don't let gargbage in
    id: feItem.id,
    name: feItem.name,
    refTag: feItem.refTag,
    description: feItem.description,
    defaultEngagementRestriction: feItem.defaultEngagementRestriction,
    negativeImpactDescription: feItem.negativeImpactDescription,
    seductionDescription: feItem.seductionDescription,
    mitigationTactics: feItem.mitigationTactics
  }
}

export const fetchVices = createAsyncThunk(
  'vices/fetchVices',
  async (payload) => {
    return client.get(
      apiUrl + '/vices' + '?userId=' + payload.user + '')
      .then(response => {
        return convertApiToFe(response.Items)
      })
  })

export const syncDirtyVices = createAsyncThunk(
  'vices/syncDirtyVices',
  async (payload, { getState }) => {
    const dirtyVices = selectAllVices(getState()).filter(vice => vice.dirtiness === 'SAVING')
    if (dirtyVices.length === 0) return Promise.resolve();
    async function syncEntity(apiVice) {
      const body = {
        userId: "testUser",
        vice: apiVice,
        httpMethod: "POST"
      }
      return client.post(apiUrl + '/vices', body)
    }
    let promises = dirtyVices.map(feVice => convertFeToApi(feVice)).map(syncEntity)
    return Promise.allSettled(promises)
  }
)

export const viceSlice = createSlice({
  name: 'vices',
  initialState,
  reducers: {
    createNewVice(state, action) {
      const { id, name, tag } = action.payload
      // TODO: validation on reftag and ID uniqueness
      const newVice = {
        id,
        name,
        refTag: tag,
        description: "",
        defaultEngagementRestriction: {
          kind: 0, 
        },
        negativeImpactDescription: "",
        seductionDescription: "",
        mitigationTactics: [],
        dirtiness: 'DIRTY'
      }
      vicesAdapter.upsertOne(state, newVice)
    },
    updateVice(state, action) {
      const { viceId, changedFields } = action.payload
      const vice = state.entities[viceId]
      Object.entries(changedFields).forEach(([field, value]) => vice[field] = value)
      vice.dirtiness = 'DIRTY'
    },
  },
  extraReducers: {
    [fetchVices.fulfilled]: (state, action) => {
      vicesAdapter.setAll(state, action.payload.entities)
    },
    [syncDirtyVices.pending]: (state, action) => {
      const vicesInFlight = Object.values(state.entities).filter((vice) => vice.dirtiness === 'DIRTY')
      vicesInFlight.forEach((vice) => vice.dirtiness = 'SAVING')
    },
    [syncDirtyVices.fulfilled]: (state, action) => {
      const vicesInFlight = Object.values(state.entities).filter((vice) => vice.dirtiness === 'SAVING')
      // Only set the in-flight entries to 'CLEAN' so any changes made during
      // the request will be sent on the next fetch.
      vicesInFlight
        .filter((vice) => vice.dirtiness === 'SAVING')
        .forEach((vice) => vice.dirtiness = 'CLEAN')
    },
    [syncDirtyVices.rejected]: (state, action) => {
      const vicesInFlight = Object.values(state.entities).filter((vice) => vice.dirtiness === 'SAVING')
      // TODO surface error, switch gui togle to manual rather than timed
      vicesInFlight
        .filter((vice) => vice.dirtiness === 'SAVING')
        .forEach((vice) => vice.dirtiness = 'DIRTY')
    },
  }
})

export const { createNewVice, updateVice } = viceSlice.actions

export default viceSlice.reducer

export const {
  selectAll: selectAllVices,
  selectById: selectViceById,
  selectIds: selectViceIds
  // Pass in a selector that returns the posts slice of state
} = vicesAdapter.getSelectors(state => state.vices)

export const selectViceByRefTag = createSelector(
  [selectAllVices, (state, refTag) => refTag],
  (vices, refTag) => vices.find(v => v.refTag === refTag)
)