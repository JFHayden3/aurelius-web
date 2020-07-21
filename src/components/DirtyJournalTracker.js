
// tracks the 'dirtiness' of the journal model state and periodically
// invokes the 'sync' function to push changes to the server
import { useEffect } from 'react'
import { useSelector, useDispatch,useStore } from 'react-redux'

import { selectDirtyEntries, dispatchSyncDirtyEntitiesWithDelay } from '../model/journalEntriesSlice'
import React, { Component } from 'react'

export const DirtyJournalTracker = () => {
  const useThunkDispatch = useStore().dispatch  
  const getState = useStore().getState
  const dirtyEntries = useSelector(selectDirtyEntries)
  const isDirty = dirtyEntries.length > 0
  if (isDirty) {
    console.log("blah dispatching")
    dispatchSyncDirtyEntitiesWithDelay()(useThunkDispatch, getState)
  }
  return (
    <div>Is DIRTY: {isDirty.toString()}</div>
  )
}