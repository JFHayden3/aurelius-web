import {
  createAsyncThunk,
  createSelector,
  createSlice
} from '@reduxjs/toolkit'
import { apiUrl } from '../kitchenSink'
import { client } from '../api/client'

const defaultInitialSettings = {
  savedViceRestrictions: {
    0: {
      displayName: "Unrestricted",
      isUserCreated: false,
      spec: []
    },
    1: {
      displayName: "Forbidden",
      isUserCreated: false,
      spec: [
        {
          restriction: "Total abstinence",
          appliesOn: [0, 1, 2, 3, 4, 5, 6],
          notes: ""
        }
      ]
    },
  },
  // Also defines set of available article kinds
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
      ordering: 2,
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
      hintText: "A specific plan to accomplish today's intentions.",
      promptFrequency: "DAILY",
      ordering: 4,
      isUserCreated: false,
    },
  }
}

export function computeNewSavedViceRestrictionId(state) {
  const numericalKeys = Object.keys(state.settings.savedViceRestrictions)
    .map(viceKey => Number.parseInt(viceKey))
    .filter(e => e)
  return "" + Math.max.apply(null, numericalKeys) + 1
}

function convertApiToFe(apiItems) {
  // TODO (IMPORTANT): just merging in the default settings here is problematic.
  // I won't have a way to introduce new defualt settings after a user first creats
  // an account and there's also a risk of colliding keys. Probably going to need to
  // keep user and system settings separate in here and merge them together whenever 
  // I need to display something
  if (apiItems.length === 0) {
    return defaultInitialSettings
  } else if (apiItems.length === 1) {
    return JSON.parse(apiItems[0].Settings)
  } else {
    // Shouldn't be possible.
    // TODO good way to log this error so I'll be notified
    console.log("MULTIPLE SETTINGS!" + apiItems)
    let longestSettings = null
    let longestSettingsLen = 0
    apiItems.foreach(item => {
      if (item.length >= longestSettingsLen) {
        longestSettings = item
        longestSettingsLen = item.length
      }
    })
    return JSON.parse(longestSettings)
  }
}

function convertFeToApi(feSettings) {
  const api =
  {
    savedViceRestrictions: feSettings.savedViceRestrictions,
    articleSettings: feSettings.articleSettings
  }
  return api
}

export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (payload) => {
    return client.get(
      apiUrl + '/settings' + '?userId=' + payload.user + '')
      .then(response => {
        return convertApiToFe(response.Items)
      })
  })

export const saveSettings = createAsyncThunk(
  'settings/saveSettings',
  async (payload, { getState }) => {
    const feSettings = getState().settings
    const apiSettings = convertFeToApi(feSettings)
    const body = {
      userId: "testUser",
      settings: apiSettings,
      httpMethod: "POST"
    }
    return client.post(apiUrl + '/settings', body)
  }
)

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
  ).sort(([akey, aSettings], [bkey, bSettings]) => aSettings.ordering - bSettings.ordering)
    .map(([key, value]) => key)
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState: {},
  reducers: {
    makeCustomViceRestrictionSaved(state, action) {
      // Takes a '**custom**' restriction and makes it saved so it can be shared
      // across other vices (I have no idea why I've spent two days on this...)
      const { customRestrictionKey, newKey, displayName } = action.payload
      const savedRestriction = {
        displayName,
        isUserCreated: true,
        spec: state.savedViceRestrictions[customRestrictionKey].spec
      } 
      state.savedViceRestrictions[newKey] = savedRestriction
      delete state.savedViceRestrictions[customRestrictionKey]
    },
    updateViceRestriction(state, action) {
      const { key, displayName, spec } = action.payload
      state.savedViceRestrictions[key] = {
        displayName,
        isUserCreated: true, // Only user-created vices can be updated
        spec
      }
    },
  },
  extraReducers: {
    [fetchSettings.fulfilled]: (state, action) => {
      state.savedViceRestrictions = action.payload.savedViceRestrictions
      state.articleSettings = action.payload.articleSettings
    },
  },
})

export const { updateViceRestriction, makeCustomViceRestrictionSaved } = settingsSlice.actions

export default settingsSlice.reducer

export function selectArticleSettingByArticleKind(state, articleKind) {
  return state.settings.articleSettings[articleKind]
}

export function selectAllArticleSettings(state) {
  // TODO: better init logic. This shoudln't be necessary and its probably dangerous
  if (!state.settings.articleSettings) {
    console.error("BLAH REMEMBER TO FIX THIS")
    return {}
  }
  return state.settings.articleSettings
}

export const selectViceRestrictions =
  (state) => state.settings.savedViceRestrictions


