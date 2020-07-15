import { 
  createEntityAdapter,
  createSlice } from '@reduxjs/toolkit'

const entriesAdapter = createEntityAdapter()

const initialState = entriesAdapter.getInitialState({
  ids:[1, 2, 3],
  entities: {
    1: {
      id:1,
      date: (Date.now()),
      articleIds:[11, 12, 13 ]
    },
    2: {
      id:2,
      date: (Date.parse("2020-10-30")),
      articleIds: []
    },
    3: {
      id:3,
      date: (Date.parse("2020-10-28")),
      articleIds: []
    }
  }
})

export const journalEntriesSlice = createSlice({
  name: 'journalEntries',
  initialState,
  reducers: {
   
  }
})

//export const { increment, decrement, incrementByAmount } = counterSlice.actions

export default journalEntriesSlice.reducer

// Export the customized selectors for this adapter using `getSelectors`
export const {
  selectAll: selectAllEntries,
  selectById: selectEntryById,
  selectIds: selectEntryIds,
  // Pass in a selector that returns the entries slice of state
} = entriesAdapter.getSelectors(state => state.journalEntries)