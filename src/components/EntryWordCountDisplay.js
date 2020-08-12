import React from 'react'

import { useSelector } from 'react-redux'
import { selectArticleIdsForEntry } from "../model/journalEntriesSlice"
import { selectWordCount } from "../model/journalArticlesSlice"
import { selectTargetDailyWordCount } from "../model/settingsSlice"
export const EntryWordCountDisplay = ({ entryId }) => {
  const articleIds = useSelector(state => selectArticleIdsForEntry(state, entryId))
  const wordCount = useSelector(state => selectWordCount(state, articleIds))
  const targetWordCount = useSelector(selectTargetDailyWordCount)
  return (
    <div>{wordCount} words of target word count: {targetWordCount}. {targetWordCount - wordCount} until goal! </div>
  )
}