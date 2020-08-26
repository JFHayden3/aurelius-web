import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import journalArticlesReducer from '../src/model/journalArticlesSlice'
import journalEntriesReducer from '../src/model/journalEntriesSlice'
import lifeJournalReducer from '../src/model/lifeJournalSlice'
import settingsSlice from './model/settingsSlice'
import viceSlice from './model/viceSlice'
import virtueSlice from './model/virtueSlice'
import viceLogSlice from './model/viceLogSlice'

const loggerMiddleware = createLogger()

export default configureStore({
  reducer: {
    journal: lifeJournalReducer,
    journalEntries: journalEntriesReducer,
    journalArticles: journalArticlesReducer,
    settings: settingsSlice,
    vices: viceSlice,
    viceLogs: viceLogSlice,
    virtues: virtueSlice,
  },
  middleware: [loggerMiddleware, thunkMiddleware, ...getDefaultMiddleware()]
})