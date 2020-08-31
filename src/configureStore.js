import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import journalArticlesReducer from '../src/model/journalArticlesSlice'
import journalEntriesReducer from '../src/model/journalEntriesSlice'
import settingsSlice from './model/settingsSlice'
import viceSlice from './model/viceSlice'
import virtueSlice from './model/virtueSlice'
import viceLogSlice from './model/viceLogSlice'
import metaSlice from './model/metaSlice'

const loggerMiddleware = createLogger()

export default configureStore({
  reducer: {
    journalEntries: journalEntriesReducer,
    journalArticles: journalArticlesReducer,
    meta: metaSlice,
    settings: settingsSlice,
    vices: viceSlice,
    viceLogs: viceLogSlice,
    virtues: virtueSlice,
  },
  middleware: [loggerMiddleware, thunkMiddleware, ...getDefaultMiddleware()]
})