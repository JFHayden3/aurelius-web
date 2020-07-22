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
      const { entryId, articleId, articleKind } = action.payload
      // TODO just filling in dummy available values. Need to reach into settings
      const newArticle = {
        id: articleId,
        kind: articleKind,
        title: (articleKind + " - title"),
        content: {
          hint: (articleKind + " - hint text"),
          text:""
        },
      }
      articlesAdapter.upsertOne(state, newArticle)
    },
    textUpdated(state, action) {
      const { articleId, text } = action.payload
      const existingArticle = state.entities[articleId]
      if (existingArticle) {
        existingArticle.content.text = text
      }
    },
    createDefaultArticles(state, action) {
      const { dateId } = action.payload
      const articleIds = ["01", "02", "03"].map(ext => Number.parseInt(dateId + ext))
      //  Entry: "{"date":20200715,"articles":[{"id":11,"kind":"INTENTIONS","title":"Intentions","content":{"hint":"intentions hint","text":"intentions text"}},{"id":12,"kind":"REFLECTIONS","title":"Reflections","content":{"hint":"reflections hint","text":"reflections text"}}]}"
      function createTextArticle(id, kind, title, hint) {
        return {
          id: id,
          kind: kind,
          title: title,
          content: {
            hint: hint,
            text: ""
          },
        }
      }
      const defaultArticles =
        [
          createTextArticle(Number.parseInt(dateId + '01'), 'REFLECTION', "Reflections", "Some recent reflections"),
          createTextArticle(Number.parseInt(dateId + '02'), 'INTENTION', "Intentions", "Today's intentions"),
        ]
      articlesAdapter.upsertMany(state, defaultArticles)
    }

  },
  extraReducers: {
    // TODO: either consolidate here or remove the need for a separate initial fetch method
    'journalEntries/fetchEntries/fulfilled': (state, action) => {
      // Note that the payload here is formed in the async thunk in
      // Journal entries slice as that's where we first fondle the
      // fetched results.
      articlesAdapter.setAll(state, action.payload.articles)
    },
    'journalEntries/createNewEntry': (state, action) => {
      console.log("\n\n" + JSON.stringify(action))
    },
    'journalEntries/addArticle':(state, action) => {
      console.log(JSON.stringify(action))
    }
  }
})

export const { textUpdated, createDefaultArticles, addArticle } = journalArticlesSlice.actions

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