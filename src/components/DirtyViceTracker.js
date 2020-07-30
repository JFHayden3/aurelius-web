
// tracks the 'dirtiness' of the journal model state and periodically
// invokes the 'sync' function to push changes to the server
import { useSelector, useDispatch, useStore } from 'react-redux'
import { PlusCircleOutlined } from '@ant-design/icons';

import { selectDirtiness, dispatchSaveViceWithDelay, selectViceById } from '../model/viceSlice'
import React, { Component } from 'react'

export const DirtyViceTracker = ({ viceId }) => {
  const dispatch = useDispatch()
  const getState = useStore().getState
  const vice = useSelector((state) => selectViceById(state, viceId))
  const dirtiness = vice.dirtiness //useSelector((state) => selectDirtiness(state, viceId))
  const isDirty = dirtiness === 'DIRTY'
  const isSaving = dirtiness === 'SAVING'
  if (isDirty) {
    //dispatchSaveViceWithDelay(viceId)(dispatch, getState)
  }
  return (
    <div>
    {dirtiness}
      {isDirty && <div> Is DIRTY</div>}
      {isSaving && <div> Is saving </div>}
    </div>
  )
}