import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice
} from '@reduxjs/toolkit'
import { apiUrl } from '../kitchenSink'
import { client } from '../api/client'

const virtuesAdapter = createEntityAdapter()

const dummyState =
{
  1: {
    id: 1,
    name: "Exercise",
    refTag: "exercise",
    description: "Could take many forms these days, but just something to get my blood moving and my muscles flexing",
    engagementSchedule: [
      { days: [1, 2, 3, 4, 5], times: [{ optTime: null, optDuration: null }] },
    ],
    positiveImpactDescription: "Doob exercise important",
  },
}

const initialState = virtuesAdapter.getInitialState()

export function computeNextVirtueId(state) {
  const existingIds = selectVirtueIds(state)
  return existingIds.length > 0 ? Math.max.apply(null, existingIds) + 1 : 0
}

function convertApiToFe(apiItems) {
  const virtues = Array.map(apiItems, (item) => {
    const apiVirtue = JSON.parse(item.Virtue)
    return {
      // Explicit about the mapping here so we don't let gargbage in
      id: apiVirtue.id,
      name: apiVirtue.name,
      refTag: apiVirtue.refTag,
      description: apiVirtue.description,
      engagementSchedule: apiVirtue.engagementSchedule,
      positiveImpactDescription: apiVirtue.positiveImpactDescription,
      dirtiness: 'CLEAN'
    }
  })

  return { entities: virtues }
}

function convertFeToApi(feItem) {
  return {
    // Explicit about the mapping here so we don't let gargbage in
    id: feItem.id,
    name: feItem.name,
    refTag: feItem.refTag,
    description: feItem.description,
    engagementSchedule: feItem.engagementSchedule,
    positiveImpactDescription: feItem.positiveImpactDescription,
  }
}

export const fetchVirtues = createAsyncThunk(
  'virtues/fetchVirtues',
  async (payload) => {
    return client.get(
      apiUrl + '/virtues' + '?userId=' + payload.user + '')
      .then(response => {
        return convertApiToFe(response.Items)
      })
  })

export const syncDirtyVirtues = createAsyncThunk(
  'virtues/syncDirtyVirtues',
  async (payload, { getState }) => {
    const dirtyVirtues = selectAllVirtues(getState()).filter(virtue => virtue.dirtiness === 'SAVING')
    if (dirtyVirtues.length === 0) return Promise.resolve();
    async function syncEntity(apiVirtue) {
      const body = {
        userId: "testUser",
        virtue: apiVirtue,
        httpMethod: "POST"
      }
      return client.post(apiUrl + '/virtues', body)
    }
    let promises = dirtyVirtues.map(feVirtue => convertFeToApi(feVirtue)).map(syncEntity)
    return Promise.allSettled(promises)
  }
)

export const virtueSlice = createSlice({
  name: 'virtues',
  initialState,
  reducers: {
    createNewVirtue(state, action) {
      const { id, name, tag } = action.payload
      // TODO: validation on reftag and ID uniqueness
      const newVirtue = {
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
      virtuesAdapter.upsertOne(state, newVirtue)
    },
    updateVirtue(state, action) {
      const { virtueId, changedFields } = action.payload
      const virtue = state.entities[virtueId]
      Object.entries(changedFields).forEach(([field, value]) => virtue[field] = value)
      virtue.dirtiness = 'DIRTY'
    },
  },
  extraReducers: {
    [fetchVirtues.fulfilled]: (state, action) => {
      virtuesAdapter.setAll(state, action.payload.entities)
    },
    [syncDirtyVirtues.pending]: (state, action) => {
      const virtuesInFlight = Object.values(state.entities).filter((virtue) => virtue.dirtiness === 'DIRTY')
      virtuesInFlight.forEach((virtue) => virtue.dirtiness = 'SAVING')
    },
    [syncDirtyVirtues.fulfilled]: (state, action) => {
      const virtuesInFlight = Object.values(state.entities).filter((virtue) => virtue.dirtiness === 'SAVING')
      // Only set the in-flight entries to 'CLEAN' so any changes made during
      // the request will be sent on the next fetch.
      virtuesInFlight
        .filter((virtue) => virtue.dirtiness === 'SAVING')
        .forEach((virtue) => virtue.dirtiness = 'CLEAN')
    },
    [syncDirtyVirtues.rejected]: (state, action) => {
      const virtuesInFlight = Object.values(state.entities).filter((virtue) => virtue.dirtiness === 'SAVING')
      // TODO surface error, switch gui togle to manual rather than timed
      virtuesInFlight
        .filter((virtue) => virtue.dirtiness === 'SAVING')
        .forEach((virtue) => virtue.dirtiness = 'DIRTY')
    },
  }
})

export const { createNewVirtue, updateVirtue } = virtueSlice.actions

export default virtueSlice.reducer

export const {
  selectAll: selectAllVirtues,
  selectById: selectVirtueById,
  selectIds: selectVirtueIds
  // Pass in a selector that returns the posts slice of state
} = virtuesAdapter.getSelectors(state => state.virtues)

export const selectVirtueByRefTag = createSelector(
  [selectAllVirtues, (state, refTag) => refTag],
  (virtues, refTag) => virtues.find(v => v.refTag === refTag)
)