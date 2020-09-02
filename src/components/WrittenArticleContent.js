// text area with relevant hint text. Provides a typeahead 
// dropdown and automatic highlighting/linking for references to
// vices/growths

import React from 'react'
import { Input } from 'antd';
import { selectArticleById, textUpdated } from '../model/journalArticlesSlice'
import { useSelector, useDispatch } from 'react-redux'
import { TaggableTextField } from './TaggableTextField'
const { TextArea } = Input;

export const WrittenArticleContent = ({ articleId }) => {
  const dispatch = useDispatch()
  const article = useSelector((state) => selectArticleById(state, articleId))
  const { title, kind, content } = article
  const onChange = val => {
    dispatch(textUpdated({ articleId: articleId, text: val }))
  }
  return (
    <TaggableTextField
      placeholder={content.hint}
      value={content.text}
      onChange={onChange}
    />
  )
}