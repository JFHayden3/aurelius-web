
// tracks the 'dirtiness' of the journal model state and periodically
// invokes the 'sync' function to push changes to the server
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { selectAllEntries, syncDirtyEntries } from '../model/journalEntriesSlice'
import React, { Component } from 'react'

export const DirtyJournalTracker = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(syncDirtyEntries())
    }, 2500);
    return () => clearInterval(interval);
  }, []);
  const dirtyEntries = useSelector(selectAllEntries).filter((entry) => entry.isDirty)
  const isDirty = dirtyEntries.length > 0
  return (
    <div>Is DIRTY: {isDirty.toString()}</div>
  )
}