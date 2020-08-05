

import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectArticleById } from '../model/journalArticlesSlice'
import { RestrictionListItem } from './RestrictionListItem'
import { RestrictionAdder } from './RestrictionAdder'

export const RestrictionList = ({ articleId }) => {
  const article = useSelector((state) => selectArticleById(state, articleId))
  const dispatch = useDispatch()
  const restrictions = article.content.restrictions || []
 // TODO: inline restriction adding: <RestrictionAdder articleId={articleId} addIndex={index} />
  return (
    <div>
        {restrictions && restrictions.map((restriction, index) => (
          <div key={restriction.id}>
            <RestrictionListItem articleId={articleId} restrictionId={restriction.id} />
          </div>
        ))}
      <RestrictionAdder articleId={articleId} />
    </div>

  )
}