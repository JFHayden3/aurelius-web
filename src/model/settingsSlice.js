import {
  createAsyncThunk,
  createSelector,
  createSlice
} from '@reduxjs/toolkit'
import { getSettings } from '../graphql/queries'
import { updateSettings, createSettings } from '../graphql/mutations'
import { API, graphqlOperation } from "aws-amplify"
import { selectFetchUserField } from './metaSlice'


const systemSettings = {
  targetDailyWordCount: 500,
  savedViceRestrictions: {
    0: {
      displayName: "Unrestricted",
      isUserCreated: false,
      spec: [
        {
          condition: {
            isNegation: false,
            details: {
              interval: {
                begin: { kind: 'OPEN', spec: null },
                end: { kind: 'OPEN', spec: null }
              }
            }
          },
          appliesOn: [0, 1, 2, 3, 4, 5, 6],
          notes: ""
        }
      ]
    },
    1: {
      displayName: "Forbidden",
      isUserCreated: false,
      spec: [
        {
          condition: {
            isNegation: true,
            details: {
              interval: {
                begin: { kind: 'OPEN', spec: null },
                end: { kind: 'OPEN', spec: null }
              }
            }
          },
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
      allowMultiplePerEntry: false,
      isUserCreated: false,
    },
    DREAMS: {
      title: "Dreams",
      hintText: "Any dreams last night you'd like to record?",
      promptFrequency: { kind: "DAILY", details: null },
      ordering: 2,
      allowMultiplePerEntry: false,
      isUserCreated: false,
    },
    GRATITUDE: {
      title: "Gratitude",
      hintText: "Anything happen recently that you'd like to express something positive about?",
      promptFrequency: { kind: "DAILY", details: null },
      ordering: 4,
      allowMultiplePerEntry: false,
      isUserCreated: false,
    },
    AGENDA: {
      title: "Intentions",
      hintText: "What kind of day would you like to have? When you're in bed tonight reflecting on the day, what will make you feel proud -- like the day was worth showing up for?",
      promptFrequency: { kind: "DAILY", details: null },
      ordering: 3,
      allowMultiplePerEntry: false,
      isUserCreated: false,
    },
    VICE_LOG_V2: {
      title: "Vice log entry",
      hintText: "A recording and accounting of a particular unintentional lapse into a negative behavior",
      promptFrequency: { kind: "NEVER", details: null },
      ordering: 6,
      allowMultiplePerEntry: true,
      isUserCreated: false,
    },
  }
}

export function computeNewSavedViceRestrictionId(state) {
  const numericalKeys = Object.keys(state.settings.savedViceRestrictions)
    .map(viceKey => Number.parseInt(viceKey))
    .filter(e => e)
  return "" + (Math.max.apply(null, numericalKeys) + 1)
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

  // Kill any legacy system-defined article settings
  Object.entries(userSettings.articleSettings).forEach(([key, settingFromUser]) => {
    if (!(key in systemSettings.articleSettings) && !settingFromUser.isUserCreated) {
      delete userSettings.articleSettings[key]
    }
  })
}

function convertApiToFe(apiItem) {
  let userArticleSettings = {}
  if (apiItem) {
    userArticleSettings = JSON.parse(apiItem.settings)
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
  async (payload, { getState }) => {
    const userId = selectFetchUserField(getState())
    return API.graphql(graphqlOperation(getSettings, { userId }))
      // TODO: create settings here if response empty or on user creation trigger?
      .then(response => {
        return convertApiToFe(response.data.getSettings)
      })
  })

export const saveSettings = createAsyncThunk(
  'settings/saveSettings',
  async (payload, { getState }) => {
    const userId = selectFetchUserField(getState())
    const feSettings = getState().settings
    const apiSettings = convertFeToApi(feSettings)
    const operation = graphqlOperation(updateSettings, { input: { userId, settings: JSON.stringify(apiSettings) } })
    return API.graphql(operation)
  }
)

export function getDefaultArticleKindsForToday(state, today) {
  return Object.entries(state.settings.articleSettings).filter(
    ([articleKind, settings]) => {
      switch (settings.promptFrequency.kind) {
        case 'DAILY':
          return true
        case 'SPECIFIC_DOW':
          const todayDoW = today.getDay()
          const specificDays = settings.promptFrequency.details
          return specificDays.includes(todayDoW)
        case 'NEVER':
          return false
        case 'RANDOMLY':
          const probability = settings.promptFrequency.details
          return (Math.floor((Math.random() * 100) + 1)) <= probability
        default:
          // TODO Shouldn't be possible and should log an error to an online console somewhere
          console.log("Unsupported prompt frequency: " + settings.promptFrequency.kind)
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
      const { key, title, hintText, promptFrequency } = action.payload
      const ordering = Math.max.apply(null, (Object.values(state.articleSettings).map(as => as.ordering))) + 1

      state.articleSettings[key] = { title, hintText, promptFrequency, ordering, isUserCreated: true }
    },
    updateArticleSetting(state, action) {
      const { articleKind, updates } = action.payload
      Object.entries(updates)
        .forEach(([field, value]) => state.articleSettings[articleKind][field] = value)
    },
    removeUserCreatedArticleSettings(state, action) {
      const { articleKey } = action.payload
      delete state.articleSettings[articleKey]
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
  updateArticleSetting,
  removeUserCreatedArticleSettings } = settingsSlice.actions

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

export const selectNextUserCreatedArticleSettingsId =
  (state) =>
    Math.max.apply(null,
      Object.keys(state.settings.articleSettings)
        .map(key => Number.isNaN(Number.parseInt(key)) ? 0 : Number.parseInt(key))) + 1

