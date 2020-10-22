import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import journalArticlesReducer from '../src/model/journalArticlesSlice'
import journalEntriesReducer from '../src/model/journalEntriesSlice'
import settingsSlice from './model/settingsSlice'
import metaSlice from './model/metaSlice'
import dirtinessSlice from './model/dirtinessSlice'
import tagEntitysSlice from './model/tagEntitySlice'

const loggerMiddleware = createLogger()

export default configureStore({
  reducer: {
    journalEntries: journalEntriesReducer,
    journalArticles: journalArticlesReducer,
    tagEntitys: tagEntitysSlice,
    dirtiness: dirtinessSlice,
    meta: metaSlice,
    settings: settingsSlice,
  },
  middleware: [loggerMiddleware, thunkMiddleware, ...getDefaultMiddleware()]
})