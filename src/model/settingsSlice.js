import {
  createEntityAdapter,
  createSelector,
  createSlice
} from '@reduxjs/toolkit'

const dummyState = {
  // Also defines set of available article kinds
  savedViceRestrictions: {
    NONE: {
      displayName:"Unrestricted",
      isUserCreated:false,
      spec: []
    },
    FORBIDDEN: {
      displayName:"Forbidden",
      isUserCreated:false,
      spec: [
        {
          restriction:"Total abstinence",
          appliesOn:[0, 1, 2, 3, 4, 5, 6],
          notes:""
        }
      ]
    },
  },
  articleSettings: {
    INTENTION: {
      title: "Intentions",
      hintText: "What kind of day would you like to have? When you're in bed tonight reflecting on the day, what will make you feel proud -- like the day was worth showing up for?",
      promptFrequency: "DAILY",
      ordering: 3,
      isUserCreated: false,
    },
    REFLECTION: {
      title: "Reflections",
      hintText: "How have things been going lately? Spend some time thinking about recent triumphs, troubles, concerns, etc",
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
      hintText: "Anything happen recently that you'd like to express something positive about?",
      promptFrequency: "DAILY",
      ordering: 5,
      isUserCreated: false,
    },
    AGENDA: {
      title: "Agenda",
      hintText:"A specific plan to accomplish today's intentions.",
      promptFrequency: "DAILY",
      ordering:4,
      isUserCreated: false,
    },
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

export function selectViceRestrictions(state) {
  return state.settings.savedViceRestrictions
}