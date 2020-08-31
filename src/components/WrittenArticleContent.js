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
      autoSize={{ minRows: 6 }}
      value={content.text}
      style={
        {
          overFlowY: "hidden"
          , resize: "none"
 //          , fontSize: "16px" 
          , lineHeight: "1.3em"
          , fontFamily: "helvetica, sans-serif"
          , border: 0
        }
      }
      onChange={onChange}
    />
    /**<TextArea
      autoSize={{ minRows: 6 }}
      size='large'
      style={
        {
          overFlowY: "hidden"
          , resize: "none"
          // , fontSize: "16px" Fucks with the scrollbar appearance. Need CSS hackery likely to fix
          , lineHeight: "1.3em"
          , fontFamily: "helvetica, sans-serif"
          , border: 0
        }}
      placeholder={content.hint}
      defaultValue={content.text}
      onChange={(e) =>
        dispatch(textUpdated({ articleId: articleId, text: e.target.value }))}
    />*/
  )
}