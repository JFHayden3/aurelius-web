import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice
} from '@reduxjs/toolkit'
import { apiUrl } from '../kitchenSink'
import { client } from '../api/client'

const dummyState = {
  0: {
    id: 0,
    name: "Sober october",
    refTag: "sober-october",
    description: "Total sobriety for the month",
    startDate: 20201001,
    endDate:20201101,
    effects: [
      {
        id: 0,
        kind: 'FAST',
        viceRefTags: ['youtube', 'news-media'],
        restrictionId: 1
      },
      {
        id: 1,
        kind: 'SPRINT',
        virtueRefTag: 'exercise',
        engagementSchedule: [
          { days: [1, 3, 5], instances: [{ optTime: null, optDuration: { hour: 1, minute: 0 } }] },
          { days: [0, 6], instances: [{ optTime: { hour: 17, minute: 30 }, optDuration: { hour: 0, minute: 25 } }] },
        ]
      }
    ]
  },
  1: {
    id: 1,
    name: "Media fast",
    refTag: "media-fast",
    description: "Been getting too sucked into and distracted by news media",
    startDate: 20200903,
    endDate: 20200913,
    effects: [
      {
        id: 0,
        kind: 'FAST',
        viceRefTags: ['news-media'],
        restrictionId: 1
      },
    ]
  }
}

const challengesAdapter = createEntityAdapter()

const initialState = challengesAdapter.getInitialState()

export function computeNextChallengeId(state) {
  const existingIds = selectChallengeIds(state)
  return existingIds.length > 0 ? Math.max.apply(null, existingIds) + 1 : 0
}

function convertApiToFe(apiItems) {
  const challenges = Array.map(apiItems, (item) => {
    const apiChallenge = JSON.parse(item.Challenge)
    return {
      // Explicit about the mapping here so we don't let gargbage in
      id: apiChallenge.id,
      refTag: apiChallenge.refTag,
      name: apiChallenge.name,
      description: apiChallenge.description,
      startDate: apiChallenge.startDate,
      endDate: apiChallenge.endDate,
      effects: apiChallenge.effects,
      dirtiness: 'CLEAN'
    }
  })

  return { entities: challenges }
}

function convertFeToApi(feItem) {
  return {
    // Explicit about the mapping here so we don't let gargbage in
    id: feItem.id,
    refTag:feItem.refTag,
    name: feItem.name,
    description: feItem.description,
    startDate: feItem.startDate,
    endDate: feItem.endDate,
    effects: feItem.effects,
  }
}

export const fetchChallenges = createAsyncThunk(
  'challenges/fetchChallenges',
  async (payload) => {
    return client.get(
      apiUrl + '/challenges' + '?userId=' + payload.user + '')
      .then(response => {
        return convertApiToFe(response.Items)
      })
  })

export const syncDirtyChallenges = createAsyncThunk(
  'challenges/syncDirtyChallenges',
  async (payload, { getState }) => {
    const dirtyChallenges = selectAllChallenges(getState()).filter(challenge => challenge.dirtiness === 'SAVING')
    if (dirtyChallenges.length === 0) return Promise.resolve();
    async function syncEntity(apiChallenge) {
      const body = {
        userId: "testUser",
        challenge: apiChallenge,
        httpMethod: "POST"
      }
      return client.post(apiUrl + '/challenges', body)
    }
    let promises = dirtyChallenges.map(feChallenge => convertFeToApi(feChallenge)).map(syncEntity)
    return Promise.allSettled(promises)
  }
)

export const deleteChallenge = createAsyncThunk(
  'challenges/deleteChallenge',
  async (payload) => {
    return client.delete(
      apiUrl + '/challenges' + '?userId=testUser' + '&challengeId=' + payload.challengeId + '')
  }
)

export const challengeSlice = createSlice({
  name: 'challenges',
  initialState,
  reducers: {
    createNewChallenge(state, action) {
      const { id, name, refTag } = action.payload
      // TODO: validation on reftag and ID uniqueness
      const newChallenge = {
        id,
        name,
        refTag,
        description: "",
        startDate: null,
        endDate: null,
        effects: [],
        /** { id: #, 
         *    kind: [FAST|SPRINT], 
         *    (if virtue) virtueRefTag: #
         *    (if vice) viceRefTags: []
         *    (if virtue) engagementSchedule: [{days:[], instances: [{optTime}]}],
         *    (if vice) restrictionId: (id)
         *  } */
        dirtiness: 'DIRTY'
      }
      challengesAdapter.upsertOne(state, newChallenge)
    },
    updateChallenge(state, action) {
      const { challengeId, changedFields } = action.payload
      const challenge = state.entities[challengeId]
      Object.entries(changedFields).forEach(([field, value]) => challenge[field] = value)
      challenge.dirtiness = 'DIRTY'
    },
  },
  extraReducers: {
    [fetchChallenges.fulfilled]: (state, action) => {
      challengesAdapter.setAll(state, action.payload.entities)
    },
    [syncDirtyChallenges.pending]: (state, action) => {
      const challengesInFlight = Object.values(state.entities).filter((challenge) => challenge.dirtiness === 'DIRTY')
      challengesInFlight.forEach((challenge) => challenge.dirtiness = 'SAVING')
    },
    [syncDirtyChallenges.fulfilled]: (state, action) => {
      const challengesInFlight = Object.values(state.entities).filter((challenge) => challenge.dirtiness === 'SAVING')
      // Only set the in-flight entries to 'CLEAN' so any changes made during
      // the request will be sent on the next fetch.
      challengesInFlight
        .filter((challenge) => challenge.dirtiness === 'SAVING')
        .forEach((challenge) => challenge.dirtiness = 'CLEAN')
    },
    [syncDirtyChallenges.rejected]: (state, action) => {
      const challengesInFlight = Object.values(state.entities).filter((challenge) => challenge.dirtiness === 'SAVING')
      // TODO surface error, switch gui togle to manual rather than timed
      challengesInFlight
        .filter((challenge) => challenge.dirtiness === 'SAVING')
        .forEach((challenge) => challenge.dirtiness = 'DIRTY')
    },
    [deleteChallenge.fulfilled]: (state, action) => {
      challengesAdapter.removeOne(state, action.meta.arg.challengeId)
    },
  }
})

export const { createNewChallenge, updateChallenge } = challengeSlice.actions

export default challengeSlice.reducer

export const {
  selectAll: selectAllChallenges,
  selectById: selectChallengeById,
  selectIds: selectChallengeIds
  // Pass in a selector that returns the posts slice of state
} = challengesAdapter.getSelectors(state => state.challenges)

