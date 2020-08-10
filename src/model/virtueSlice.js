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
      { days: [1, 2, 3, 4, 5], instances: [{ optTime: null, optDuration: null }] },
    ],
    positiveImpactDescription: "Doob exercise important",
    engagementTactics: [
      { id: 1, text: "Pre-workout" },
    ],
  },
  2: {
    id: 2,
    name: "Self-authoring",
    refTag: "self-authoring",
    description: "Making some progress in the self-authoring suite",
    engagementSchedule: [
      { days: [0, 6], instances: [{ optTime: null, optDuration: { hour: 1, minute: 0 } }] },
    ],
    positiveImpactDescription: "Helping to put my psyche back together",
    engagementTactics: [
      { id: 1, text: "Setting aside time in the morning to work on this with reasonable milestones" }
    ]
  },
  3: {
    id: 3,
    name: "Music practice",
    refTag: "music-practice",
    description: "Practicing drums or piano",
    engagementSchedule: [
      { days: [1, 3], instances: [{ optTime: { hour: 17, minute: 30 }, optDuration: { hour: 0, minute: 25 } }] },
      { days: [6], instances: [{ optTime: null, optDuration: { hour: 0, minute: 25 } }] },
    ],
    positiveImpactDescription: "It's hard, brings me closer to some people, makes me appreciate music more",
    engagementTactics: [
      { id: 1, text: "Fuck if I know man, it's hard" },
      { id: 2, text: "Reward self with vice after some minimum practice session time" },
    ]
  },
}

const initialState = virtuesAdapter.getInitialState({ ids: Object.keys(dummyState), entities: dummyState })

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
      engagementTactics: apiVirtue.engagementTactics,
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
    engagementTactics: feItem.engagementTactics,
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
        engagementSchedule: [],
        positiveImpactDescription: "",
        engagementTactics: [],
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