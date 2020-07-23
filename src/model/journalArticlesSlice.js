import {
  createEntityAdapter,
  createSelector,
  createSlice
} from '@reduxjs/toolkit'

const articlesAdapter = createEntityAdapter()

const initialState = articlesAdapter.getInitialState()

export const journalArticlesSlice = createSlice({
  name: 'journalArticles',
  initialState,
  reducers: {
    addArticle(state, action) {
      const { entryId, articleId, articleKind, articleSettings } = action.payload
      // TODO just filling in dummy available values. Need to reach into settings
      const newArticle = {
        id: articleId,
        kind: articleKind,
        title: articleSettings.title,
        // TODO: eventually need to be smarter about non-text article content creation
        // and reading from settings
        content: {
          hint: articleSettings.hintText,
          text:""
        },
      }
      articlesAdapter.upsertOne(state, newArticle)
    },
    removeArticle(state, action) {
      const { articleId } = action.payload
      articlesAdapter.removeOne(state, articleId)
    },
    textUpdated(state, action) {
      const { articleId, text } = action.payload
      const existingArticle = state.entities[articleId]
      if (existingArticle) {
        existingArticle.content.text = text
      }
    },
  },
  extraReducers: {
    // TODO: either consolidate here or remove the need for a separate initial fetch method
    'journalEntries/fetchEntries/fulfilled': (state, action) => {
      // Note that the payload here is formed in the async thunk in
      // Journal entries slice as that's where we first fondle the
      // fetched results.
      articlesAdapter.setAll(state, action.payload.articles)
    },
  }
})

export const { textUpdated, createDefaultArticles, addArticle, removeArticle } = journalArticlesSlice.actions

export default journalArticlesSlice.reducer

// Export the customized selectors for this adapter using `getSelectors`
export const {
  selectAll: selectAllArticles,
  selectById: selectArticleById,
  selectIds: selectArticleIds
  // Pass in a selector that returns the posts slice of state
} = articlesAdapter.getSelectors(state => state.journalArticles)

export const selectArticlesByDate = createSelector(
  [selectAllArticles, (state, date) => date],
  (articles, date) => articles.filter((entry) => entry.date === date)
)