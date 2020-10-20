import React, { memo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ViceLogEntry } from './ViceLogEntry'
import { selectArticleById, updateContent } from '../model/journalArticlesSlice'

export const ViceLogV2ArticleContent = memo(({ articleId }) => {
  const dispatch = useDispatch()
  const article = useSelector((state) => selectArticleById(state, articleId))
  const { content } = article

  const onFieldChange = cf => {
    const payload = { articleId, changedFields: cf }
    dispatch(updateContent(payload))
  }
  return (
    <ViceLogEntry entry={content} onChange={onFieldChange} />
  )
})