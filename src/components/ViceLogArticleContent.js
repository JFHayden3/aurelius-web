import React from 'react'
import { useSelector } from 'react-redux'
import { ViceLogEntry } from './ViceLogEntry'
import { selectViceLogById } from '../model/viceLogSlice'

import { selectArticleById } from '../model/journalArticlesSlice'

export const ViceLogArticleContent = ({ articleId }) => {
  const article = useSelector((state) => selectArticleById(state, articleId))
  const { content } = article
  const entry = useSelector((state) => selectViceLogById(state, content.logId))
  return (
    <ViceLogEntry entry={entry} />
  )
}