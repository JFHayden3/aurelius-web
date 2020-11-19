import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice
} from '@reduxjs/toolkit'
import { selectFetchUserField } from './metaSlice'
import { API, graphqlOperation } from 'aws-amplify'
import { listTagEntitys } from '../graphql/queries'
import { createTagEntity, updateTagEntity, deleteTagEntity } from '../graphql/mutations'

const tagEntityAdapter = createEntityAdapter()

const initialState = tagEntityAdapter.getInitialState()

export function computeNextTagEntityId(state) {
  const existingIds = selectTagEntityIds(state)
  return existingIds.length > 0 ? Math.max.apply(null, existingIds) + 1 : 0
}

function convertApiToFe(apiItems) {
  const tagEntitys = Array.map(apiItems, (item) => {
    const apiTagEntity = JSON.parse(item.entity)
    const feTagEntity = { }
    Object.entries(apiTagEntity).forEach(([key, value]) => feTagEntity[key] = value)
    return feTagEntity
  })

  return { entities: tagEntitys }
}

export function convertFeToApiTagEntity(feItem) {
  const apiItem = {}
  Object.entries(feItem)
    .forEach(([key, value]) => apiItem[key] = value)
  return apiItem
}

export const fetchTagEntitys = createAsyncThunk(
  'tagEntitys/fetchTagEntitys',
  async (payload, { getState }) => {
    const userId = selectFetchUserField(getState())
    return API.graphql(graphqlOperation(listTagEntitys,
      // TODO: UI limit or some sort of purging if user gets over entity limit
      { filter: { userId: { eq: userId } }, limit: 1000 }))
      .then(response => {
        return convertApiToFe(response.data.listTagEntitys.items)
      })
  })

export const deleteTagEntityAsync = createAsyncThunk(
  'tagEntitys/deleteTagEntityAsync',
  async (payload, { getState }) => {
    const userId = selectFetchUserField(getState())
    const operation = graphqlOperation(deleteTagEntity, { input: { userId, teId: payload.tagEntityId } })
    return API.graphql(operation)
  }
)

export const createNewTagEntity = createAsyncThunk(
  'tagEntitys/createNewTagEntity',
  async (payload, { getState }) => {
    const { id, name, refTag, kind } = payload
    // TODO: validation on reftag and ID uniqueness
    const newTagEntity = {
      id,
      name,
      refTag,
      kind,
    }
    switch (kind) {
      case "CHALLENGE":
        newTagEntity.description = ""
        newTagEntity.startDate = null
        newTagEntity.endDate = null
        newTagEntity.effects = []
        break;
      case "VICE":
        newTagEntity.description = ""
        newTagEntity.defaultEngagementRestriction = { kind: 0 }
        newTagEntity.negativeImpactDescription = ""
        newTagEntity.seductionDescription = ""
        newTagEntity.mitigationTactics = []
        break;
      case "VIRTUE":
        newTagEntity.description = ""
        newTagEntity.engagementSchedule = []
        newTagEntity.positiveImpactDescription = ""
        newTagEntity.engagementTactics = []
        break;
    }

    const userId = selectFetchUserField(getState())
    const apiTagEntity = convertFeToApiTagEntity(newTagEntity)
    const operation = graphqlOperation(createTagEntity,
      {
        input:
        {
          userId
          , teId: apiTagEntity.id
          , kind
          , entity: JSON.stringify(apiTagEntity)
        }
      })

    return API.graphql(operation).then(r => { return { newEntity: newTagEntity } })
  }
)

export const tagEntitySlice = createSlice({
  name: 'tagEntitys',
  initialState,
  reducers: {
    updateEntity(state, action) {
      const { tagEntityId, changedFields } = action.payload
      const tagEntity = state.entities[tagEntityId]
      Object.entries(changedFields).forEach(([field, value]) => tagEntity[field] = value)
    },
  },
  extraReducers: {
    [fetchTagEntitys.fulfilled]: (state, action) => {
      tagEntityAdapter.setAll(state, action.payload.entities)
    },
    [createNewTagEntity.fulfilled]: (state, action) => {
      tagEntityAdapter.addOne(state, action.payload.newEntity)
    },
    [deleteTagEntityAsync.fulfilled]: (state, action) => {
      tagEntityAdapter.removeOne(state, action.meta.arg.tagEntityId)
    },
  }
})

export const { updateEntity } = tagEntitySlice.actions

export default tagEntitySlice.reducer

export const {
  selectAll: selectAllTagEntitys,
  selectById: selectTagEntityById,
  selectIds: selectTagEntityIds
  // Pass in a selector that returns the posts slice of state
} = tagEntityAdapter.getSelectors(state => state.tagEntitys)

export const selectTagEntitysByIds =
  (state, entityIds) => {
    return entityIds.map(id => state.tagEntitys.entities[id])
  }

export const selectByRefTag = createSelector(
  [selectAllTagEntitys, (state, refTag) => refTag],
  (allTagEntitys, refTag) => allTagEntitys.find(v => v.refTag === refTag)
)

export const selectByTagEntityKind = createSelector(
  [selectAllTagEntitys, (state, kind) => kind],
  (allTagEntitys, kind) => allTagEntitys.filter(te => te.kind === kind)
)

export const selectAllChallenges = createSelector(
  [selectAllTagEntitys],
  (allTagEntitys) => allTagEntitys.filter(te => te.kind === 'CHALLENGE')
)
export const selectAllVirtues = createSelector(
  [selectAllTagEntitys],
  (allTagEntitys) => allTagEntitys.filter(te => te.kind === 'VIRTUE')
)

export const selectVirtueIds = createSelector(
  [(state) => selectAllVirtues(state)],
  allVirtues => allVirtues.map(v => v.id)
)

export const selectViceIds = createSelector(
  [(state) => selectAllVices(state)],
  allVices => allVices.map(v => v.id)
)
export const selectAllVices = createSelector(
  [selectAllTagEntitys],
  (allTagEntitys) => allTagEntitys.filter(te => te.kind === 'VICE')
)

export const selectActiveChallengesForDate = createSelector(
  [state => selectAllChallenges(state), (state, YyyyMmDd) => YyyyMmDd],
  (challenges, date) => challenges.filter(c => c.startDate <= date && date < c.endDate)
)

export const selectTagEntityByIdAndKind = createSelector(
  [selectTagEntityById, (state, id, kind) => kind],
  (entity, kind) => entity && entity.kind === kind ? entity : null
)

export const selectChallengeById =
  (state, id) => selectTagEntityByIdAndKind(state, id, 'CHALLENGE')

export const selectViceById =
  (state, id) => selectTagEntityByIdAndKind(state, id, 'VICE')

export const selectVirtueById =
  (state, id) => selectTagEntityByIdAndKind(state, id, 'VIRTUE')
