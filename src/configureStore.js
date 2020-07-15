import { configureStore } from '@reduxjs/toolkit'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import journalArticlesReducer from '../src/model/journalArticlesSlice'
import journalEntriesReducer from '../src/model/journalEntriesSlice'
import lifeJournalReducer from '../src/model/lifeJournalSlice'

const loggerMiddleware = createLogger()

export default configureStore({
  reducer: {
    journal: lifeJournalReducer,
    journalEntries: journalEntriesReducer,
    journalArticles: journalArticlesReducer,
  }
})