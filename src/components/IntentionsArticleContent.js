// text area with relevant hint text. Provides a typeahead 
// dropdown and automatic highlighting/linking for references to
// vices/growths

import React, { Component } from 'react'
import { Input } from 'antd';
import { selectArticleById, textUpdated } from '../model/journalArticlesSlice'
import { useSelector, useDispatch } from 'react-redux'
const { TextArea } = Input;

export const IntentionsArticleContent = ({ articleId }) => {
  const dispatch = useDispatch()
  const article = useSelector((state) => selectArticleById(state, articleId))
  const { title, kind, content } = article
  console.log(article)
  return (
    <TextArea
      autoSize={true}
      placeholder={content.hint}
      defaultValue={content.text}
      onChange={(e) =>
        dispatch(textUpdated({ articleId: articleId, text: e.target.value }))}
    />
  )
}