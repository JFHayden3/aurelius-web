
// tracks the 'dirtiness' of the journal model state and periodically
// invokes the 'sync' function to push changes to the server
import { useSelector } from 'react-redux'

import { selectDirtyEntries, selectByDirtiness } from '../model/journalEntriesSlice'
import React from 'react'

export const DirtyJournalTracker = () => {
  const dirtyEntries = useSelector(selectDirtyEntries)
  const isDirty = dirtyEntries.length > 0
  const isSaving = useSelector((state) => selectByDirtiness(state, 'SAVING')).length > 0
  return (
    <div>
      {isDirty && <div> Is DIRTY</div>}
      {isSaving && <div> Is saving </div>}
    </div>
  )
}