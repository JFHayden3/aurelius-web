import { createSlice } from '@reduxjs/toolkit'

export const lifeJournalSlice = createSlice({
  name: 'lifeJournal',
  initialState: {
    fetchedEntryIds: []
  },
  reducers: {
   
  }
})

//export const { increment, decrement, incrementByAmount } = counterSlice.actions

export default lifeJournalSlice.reducer