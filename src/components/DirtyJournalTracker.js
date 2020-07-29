
// tracks the 'dirtiness' of the journal model state and periodically
// invokes the 'sync' function to push changes to the server
import { useSelector, useDispatch, useStore } from 'react-redux'
import { PlusCircleOutlined } from '@ant-design/icons';

import { selectDirtyEntries, dispatchSyncDirtyEntitiesWithDelay, selectByDirtiness } from '../model/journalEntriesSlice'
import React, { Component } from 'react'

export const DirtyJournalTracker = () => {
  const useThunkDispatch = useStore().dispatch
  const getState = useStore().getState
  const dirtyEntries = useSelector(selectDirtyEntries)
  const isDirty = dirtyEntries.length > 0
  const isSaving = useSelector((state)=>selectByDirtiness(state,'SAVING')).length > 0
  if (isDirty) {
    dispatchSyncDirtyEntitiesWithDelay()(useThunkDispatch, getState)
  }
  return (
    <div>
      {isDirty && <div> Is DIRTY</div>}
      {isSaving && <div> Is saving </div>}
    </div>
  )
}