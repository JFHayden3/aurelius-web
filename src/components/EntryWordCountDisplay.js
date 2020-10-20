import React, { useMemo } from 'react'

import { useSelector } from 'react-redux'
import { selectWordCount, makeSelectArticleIdsByEntryId } from "../model/journalArticlesSlice"
import { selectTargetDailyWordCount } from "../model/settingsSlice"
import { Progress } from 'antd'

export const EntryWordCountDisplay = ({ entryId }) => {
  const selectArticleIdsByEntryId = useMemo(makeSelectArticleIdsByEntryId, [])
  const articleIds = useSelector(state => selectArticleIdsByEntryId(state, entryId))
  const wordCount = useSelector(state => selectWordCount(state, articleIds))
  const targetWordCount = useSelector(selectTargetDailyWordCount)
  const wordCountPercent = (wordCount / targetWordCount) * 100
  return (
    <Progress type="circle" percent={wordCountPercent} width={50} format={percent => wordCount + ' Words'} />
  )
}