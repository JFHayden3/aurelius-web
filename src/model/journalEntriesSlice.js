import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice
} from '@reduxjs/toolkit'
import { client } from '../api/client'
const entriesAdapter = createEntityAdapter()

function apiDateToFe(str) {
  if (!/^(\d){8}$/.test(str)) {
    console.log("invalid date")
    return NaN
  }
  var y = str.substr(0, 4),
    m = str.substr(4, 2),
    d = str.substr(6, 2);
  return Date.parse(y + "-" + m + "-" + d);
}

function convertApiToFe(items) {
  const entries = Array.map(items, (item) => JSON.parse(item.Entry))
  const articles = [].concat.apply([], Array.map(entries, (entry) => entry.articles))
  //const ids = Array.map(entries, (entry) => apiDateToFe(entry.date.toString()))
  //  Entry: "{"date":20200715,"articles":[{"id":11,"kind":"INTENTIONS","title":"Intentions","content":{"hint":"intentions hint","text":"intentions text"}},{"id":12,"kind":"REFLECTIONS","title":"Reflections","content":{"hint":"reflections hint","text":"reflections text"}}]}"
  let foo = Array.map(entries, (entry) => {
    let articleIds = Array.map(entry.articles, (article) => article.id)
    let feDateFormat = apiDateToFe(entry.date.toString())
    return {
      id: feDateFormat,
      date: feDateFormat,
      articleIds: articleIds
    }
  })

  return {
    entities:foo,
    articles: articles
  }
}

export const fetchEntries = createAsyncThunk(
  'journalEntries/fetchEntries',
  async (payload) => {
    const response = await client.get(
      'https://mjsjd63379.execute-api.us-east-1.amazonaws.com/dev/journal'
      + '?userId=testUser&maxEndDate=' + payload.maxEndDate + '&maxNumEntries=' + payload.maxNumEntries + '');
    return convertApiToFe(response.Items)
  })

const initialState = entriesAdapter.getInitialState({
  ids: [1, 2, 3],
  entities: {
    1: {
      id: 1,
      date: (Date.now()),
      articleIds: [11, 12, 13]
    },
    2: {
      id: 2,
      date: (Date.parse("2020-10-30")),
      articleIds: []
    },
    3: {
      id: 3,
      date: (Date.parse("2020-10-28")),
      articleIds: []
    }
  }
})

export const journalEntriesSlice = createSlice({
  name: 'journalEntries',
  initialState,
  reducers: {

  },
  extraReducers: {
    [fetchEntries.fulfilled]: (state, action) => {
      entriesAdapter.setAll(state, action.payload.entities)
    },
  },
})

//export const { increment, decrement, incrementByAmount } = counterSlice.actions

export default journalEntriesSlice.reducer

// Export the customized selectors for this adapter using `getSelectors`
export const {
  selectAll: selectAllEntries,
  selectById: selectEntryById,
  selectIds: selectEntryIds,
  // Pass in a selector that returns the entries slice of state
} = entriesAdapter.getSelectors(state => state.journalEntries)