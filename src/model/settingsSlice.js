import {
  createAsyncThunk,
  createSelector,
  createSlice
} from '@reduxjs/toolkit'
import { apiUrl } from '../kitchenSink'
import { client } from '../api/client'

const systemSettings = {
  targetDailyWordCount: 500,
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
    REFLECTION: {
      title: "Reflections",
      hintText: "How have things been going lately? Spend some time thinking about recent triumphs, troubles, concerns, etc",
      promptFrequency: { kind: "DAILY", details: null },
      ordering: 1,
      isUserCreated: false,
    },
    DREAMS: {
      title: "Dreams",
      hintText: "Any dreams last night you'd like to record?",
      promptFrequency: { kind: "DAILY", details: null },
      ordering: 2,
      isUserCreated: false,
    },
    GRATITUDE: {
      title: "Gratitude",
      hintText: "Anything happen recently that you'd like to express something positive about?",
      promptFrequency: { kind: "DAILY", details: null },
      ordering: 4,
      isUserCreated: false,
    },
    AGENDA: {
      title: "Intentions",
      hintText: "What kind of day would you like to have? When you're in bed tonight reflecting on the day, what will make you feel proud -- like the day was worth showing up for?",
      promptFrequency: { kind: "DAILY", details: null },
      ordering: 3,
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

function mergeSystemSettingsWithUserSettings(userSettings) {
  // Pull in any missing top-level settings
  Object.entries(systemSettings).forEach(([key, value]) => {
    if (!(key in userSettings)) {
      userSettings[key] = value
    }
  })
  // Blast over the system-defined savedViceRestrictions that user might have in their
  // settings with the new hotness and add any new ones
  Object.entries(systemSettings.savedViceRestrictions).forEach(([key, settings]) => {
    userSettings.savedViceRestrictions[key] = settings
  })

  // Merge in the system-defined article settings if missing, though not overriding what the 
  // user may have changed for ordering or promptFrequency
  Object.entries(systemSettings.articleSettings).forEach(([key, systemArticleSetting]) => {
    if (key in userSettings.articleSettings) {
      // Article setting exists but might not have the most up-to-date info for title/hint text
      userSettings.articleSettings[key].title = systemArticleSetting.title
      userSettings.articleSettings[key].hintText = systemArticleSetting.hintText
    } else {
      userSettings.articleSettings[key] = systemArticleSetting
    }
  })
}

function convertApiToFe(apiItems) {
  let userArticleSettings = {}
  if (apiItems.length === 1) {
    userArticleSettings = JSON.parse(apiItems[0].Settings)
  } else if (apiItems.length > 1) {
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
    userArticleSettings = JSON.parse(longestSettings)
  }
  mergeSystemSettingsWithUserSettings(userArticleSettings)
  return userArticleSettings
}

function convertFeToApi(feSettings) {
  const api =
  {
    targetDailyWordCount: feSettings.targetDailyWordCount,
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
      if (settings.promptFrequency.kind === 'DAILY') {
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
    addUserCreatedArticleSettings(state, action) {
      const { title, hintText, promptFrequency } = action.payload
      const ordering = Math.max.apply(null, (Object.values(state.articleSettings).map(as => as.ordering))) + 1
      const key = Math.max.apply(null, 
        Object.keys(state.articleSettings)
        .map(key => Number.isNaN(Number.parseInt(key)) ? 0 : Number.parseInt(key))) + 1
      state.articleSettings[key] = { title, hintText, promptFrequency, ordering, isUserCreated:true }
    },
    updateArticleSetting(state, action) {
      const { articleKind, updates } = action.payload
      Object.entries(updates)
        .forEach(([field, value]) => state.articleSettings[articleKind][field] = value)
    },
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
    updateTargetDailyWordCount(state, action) {
      const { newWordCount } = action.payload
      state.targetDailyWordCount = newWordCount
    },
  },
  extraReducers: {
    [fetchSettings.fulfilled]: (state, action) => {
      Object.entries(action.payload).forEach(([key, value]) => {
        state[key] = value
      })
    },
  },
})

export const {
  addUserCreatedArticleSettings,
  updateViceRestriction,
  makeCustomViceRestrictionSaved,
  updateTargetDailyWordCount,
  updateArticleSetting } = settingsSlice.actions

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

export const selectTargetDailyWordCount =
  (state) => state.settings.targetDailyWordCount
