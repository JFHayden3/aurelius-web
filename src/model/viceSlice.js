import {
  createEntityAdapter,
  createSelector,
  createSlice
} from '@reduxjs/toolkit'

const vicesAdapter = createEntityAdapter()

const dummyState =
{
  1: {
    id: 1,
    name: "News Media",
    refTag: "news-media",
    description: "Compulsively checking Daily Wire numerous times per day",
    defaultEngagementRestriction: "NONE",
    negativeImpactDescription: "A brief distraction that opens a gateway to worse and makes it difficult to get anything done. Shortens my attention span in a way that's hard to recover from",
    seductionDescription: "Usually just an automatic reflex after opening the phone. Sometimes it's in response to a major news event",
    mitigationTactics: [
      { id: 1, text: "Keep phone away during day" },
      { id: 2, text: "Delete account" },
    ]
  },
  2: {
    id: 2,
    name: "YouTube",
    refTag: "youtube",
    description: "Falling down a youtube hole and burning away my whole day one 5 minute video at a time typically.",
    defaultEngagementRestriction: "NONE",
    negativeImpactDescription: "I've lost countless days to falling down youtube holes. Also makes me weird and unable to carry on normal conversations because I have all this fragmentary knowledge",
    seductionDescription: "Usually happens because I'm unwilling to seriouslly commit to any particular activity for a serious length of time.",
    mitigationTactics: [
      { id: 1, text: "Getting rid of youtube premium" },
      { id: 2, text: "Deleting youtube mobile app" },
      { id: 3, text: "Being more mindful of how I spend my free time -- deciding ahead of time" }
    ]
  },
  3: {
    id: 3,
    name: "Reddit",
    refTag: "reddit",
    description: "Aimlessly checking reddit on my phone or computer",
    defaultEngagementRestriction: "NONE",
    negativeImpactDescription: "Sort of a combination of the negatives of youtube and news media: kills my attention span, wastes non-trivial amounts of time, and fills my brain with useless fagmentary knowledge I can't talk about",
    seductionDescription: "Easy compulsion to fall into when I can't think of anything better to do with my time",
    mitigationTactics: [
      { id: 1, text: "Deleting the reddit app" },
      { id: 2, text: "Signing out on the browser" },
      { id: 3, text: "Blocking the website" },
      { id: 4, text: "Screen-time monitoring on my phone" },
    ]
  },
}

const initialState = vicesAdapter.getInitialState({ entities: dummyState, ids: (Object.keys(dummyState)) })

export function computeNextViceId(state) {
  const existingIds = selectViceIds(state)
  return existingIds.length > 0 ? Math.max.apply(null, existingIds) + 1 : 0
}

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
        defaultEngagementRestriction: "NONE",
        negativeImpactDescription: "",
        seductionDescription: "",
        mitigationTactics: [],
      }
      vicesAdapter.upsertOne(state, newVice)
    },
    updateVice(state, action) {
      const { viceId, changedFields } = action.payload
      const vice = state.entities[viceId]
      Object.entries(changedFields).forEach(([field, value]) => vice[field] = value)
    },
  },
  extraReducers: {}
})

export const { createNewVice, updateVice } = viceSlice.actions

export default viceSlice.reducer

export const {
  selectAll: selectAllVices,
  selectById: selectViceById,
  selectIds: selectViceIds
  // Pass in a selector that returns the posts slice of state
} = vicesAdapter.getSelectors(state => state.vices)
