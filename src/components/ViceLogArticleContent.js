import React from 'react'
import { useSelector } from 'react-redux'
import { ViceLogEntry } from './ViceLogEntry'
import { selectArticleById } from '../model/journalArticlesSlice'

export const ViceLogArticleContent = ({ articleId }) => {
  const article = useSelector((state) => selectArticleById(state, articleId))
  const { content } = article
  return (
    <ViceLogEntry logId={content.logId} />
  )
}