
// tracks the 'dirtiness' of the journal model state and periodically
// invokes the 'sync' function to push changes to the server
import { useSelector } from 'react-redux'

import { selectViceById } from '../model/viceSlice'
import React from 'react'

export const DirtyViceTracker = ({ viceId }) => {
  const vice = useSelector((state) => selectViceById(state, viceId))
  const dirtiness = vice.dirtiness 
  const isDirty = dirtiness === 'DIRTY'
  const isSaving = dirtiness === 'SAVING'
  return (
    <div>
    {dirtiness}
      {isDirty && <div> Is DIRTY</div>}
      {isSaving && <div> Is saving </div>}
    </div>
  )
}