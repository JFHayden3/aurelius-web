import {
  createEntityAdapter,
  createSelector,
  createSlice
} from '@reduxjs/toolkit'

const vicesAdapter = createEntityAdapter()

const dummyState =
  [
    {
      id: 1,
      name: "News Media",
      refTag: "news-media",
      description:"Compulsively checking Daily Wire numerous times per day",
      defaultEngagementRestriction: "NONE",
      negativeImpactDescription:"A brief distraction that opens a gateway to worse and makes it difficult to get anything done. Shortens my attention span in a way that's hard to recover from",
      seductionDescription:"Usually just an automatic reflex after opening the phone. Sometimes it's in response to a major news event",
      mitigationTactics: [
        "Keep phone away during day",
        "Delete account",
      ]
    },
    {
      id: 2,
      name: "YouTube",
      refTag: "youtube",
      description: "Falling down a youtube hole and burning away my whole day one 5 minute video at a time typically.",
      defaultEngagementRestriction: "NONE",
      negativeImpactDescription:"I've lost countless days to falling down youtube holes. Also makes me weird and unable to carry on normal conversations because I have all this fragmentary knowledge",
      seductionDescription:"Usually happens because I'm unwilling to seriouslly commit to any particular activity for a serious length of time.",
      mitigationTactics: [
        "Getting rid of youtube premium",
        "Deleting youtube mobile app",
        "Being more mindful of how I spend my free time -- deciding ahead of time"
      ]

    }
  ]

const initialState = vicesAdapter.getInitialState(dummyState)

export const viceSlice = createSlice({
  name: 'vices',
  initialState,
  reducers: {},
  extraReducers: {}
})

export const { } = viceSlice.actions

export default viceSlice.reducer

export const {
  selectAll: selectAllVices,
  selectById: selectViceById,
  selectIds: selectViceIds
  // Pass in a selector that returns the posts slice of state
} = vicesAdapter.getSelectors(state => state.vices)
