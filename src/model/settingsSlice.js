import {
  createEntityAdapter,
  createSelector,
  createSlice
} from '@reduxjs/toolkit'

const dummyState = {
  // Also defines set of available article kinds
  articleSettings: {
    INTENTION: {
      title: "Intentions",
      hintText: "blah blah blah intentions hint text",
      promptFrequency: "DAILY",
      ordering: 3,
      isUserCreated: false,
    },
    REFLECTION: {
      title: "Reflections",
      hintText: "blah blah reflections hint text",
      promptFrequency: "DAILY",
      ordering: 1,
      isUserCreated: false,
    },
    DREAMS: {
      title: "Dreams",
      hintText: "Any dreams last night you'd like to record?",
      promptFrequency: "DAILY",
      ordering:2,
      isUserCreated: false,
    },
    GRATITUDE: {
      title: "Gratitude",
      hintText: "Blah blah some shit about gratitude",
      promptFrequency: "DAILY",
      ordering: 4,
      isUserCreated: false,
    }
  }
}

export function getDefaultArticleKindsForToday(state) {
  return Object.entries(state.settings.articleSettings).filter(
    ([articleKind, settings]) => {
      // TODO support other frequency types such as only on specific days
      if (settings.promptFrequency === 'DAILY') {
        return true
      } else {
        return false
      }
    }
    // TODO: sort by ordering
  ).sort(([akey,aSettings], [bkey,bSettings]) => aSettings.ordering - bSettings.ordering)
  .map(([key,value]) => key)
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState:dummyState,
  reducers: {
  },
  extraReducers: {

  },
})

export default settingsSlice.reducer

export function selectArticleSettingByArticleKind(state, articleKind) {
  return state.settings.articleSettings[articleKind]
}

export function selectAllArticleSettings(state) {
  return state.settings.articleSettings
}