// text area with relevant hint text. Provides a typeahead 
// dropdown and automatic highlighting/linking for references to
// vices/growths

import React from 'react'
import { Input } from 'antd';
import { selectArticleContentById, textUpdated } from '../model/journalArticlesSlice'
import { useSelector, useDispatch } from 'react-redux'
import { TaggableTextField } from './TaggableTextField'
const { TextArea } = Input;

export const WrittenArticleContent = ({ articleId, isReadOnly }) => {
  const dispatch = useDispatch()
  const content = useSelector((state) => selectArticleContentById(state, articleId))
  const onChange = val => {
    dispatch(textUpdated({ articleId: articleId, text: val }))
  }
  return (
    <TaggableTextField
      placeholder={content.hint}
      value={content.text}
      onChange={onChange}
      isReadOnly={isReadOnly}
    />
  )
}