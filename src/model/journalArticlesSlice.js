import {
  createEntityAdapter,
  createSelector,
  createSlice
} from '@reduxjs/toolkit'

const articlesAdapter = createEntityAdapter({
  sortComparer: (a, b) => a.id > (b.id)
})

const initialState = articlesAdapter.getInitialState() 
//{
//  ids: [11, 12, 13 ],
//  entities: {
//    11: {
//      id: 11,
//      kind: 'REFLECTION',
//      title: 'Reflections',
//      content: {
//        hint: "How have things been going?",
//        text: "Blah, blah, dildoes"
//      }
//    },
//    12: {
//      id: 12,
//      kind: 'INTENTION',
//      title: 'Intentions',
//      content: {
//        hint: "What would you like to make out of this day?",
//        text: "Blah, blah, want to do important stuff"
//      }
//    },
//    13: {
//      id: 13,
//      kind: 'AGENDA',
//      title: 'Agenda',
//      content: {
//        vow: "In order to step closer to my potential I vow to do the following today",
//        items: [
//          {
//            id: 1,
//            activity: {
//              kind: "GROWTH",
//              content: "#growth-activity1"
//            },
//            optDuration: {},
//            optTime: {},
//            optNotes: "Some special notes about growth activity 1"
//          },
//          {
//            id: 2,
//            activity: {
//              kind: "CUSTOM",
//              content: "Pick up the mail"
//            },
//            optDuration: {},
//            optTime: {},
//            optNotes: "details about picking up mail"
//          },
//        ]
//      }
//    }
//  }
//})

export const journalArticlesSlice = createSlice({
  name: 'journalArticles',
  initialState,
  reducers: {
    loadArticlesFromApi(state, action) {
      const { apiArticles } = action.payload
      console.log(apiArticles)
    },
    textUpdated(state, action) {
      const { articleId, text } = action.payload
      const existingArticle = state.entities[articleId] 
      if (existingArticle) {
        existingArticle.content.text = text
      }
    }
  },
  extraReducers: {
    'journalEntries/fetchEntries/fulfilled':(state,action) => {
      console.log(action.payload.articles)
      articlesAdapter.setAll(state, action.payload.articles)
    }
  }
})

export const { textUpdated, loadArticlesFromApi } = journalArticlesSlice.actions

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