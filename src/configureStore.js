import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import journalArticlesReducer from '../src/model/journalArticlesSlice'
import journalEntriesReducer from '../src/model/journalEntriesSlice'
import settingsSlice from './model/settingsSlice'
import viceLogSlice from './model/viceLogSlice'
import metaSlice from './model/metaSlice'
import tagEntitysSlice from './model/tagEntitySlice'

const loggerMiddleware = createLogger()

export default configureStore({
  reducer: {
    journalEntries: journalEntriesReducer,
    journalArticles: journalArticlesReducer,
    tagEntitys: tagEntitysSlice,
    meta: metaSlice,
    settings: settingsSlice,
    viceLogs: viceLogSlice,
  },
  middleware: [loggerMiddleware, thunkMiddleware, ...getDefaultMiddleware()]
})