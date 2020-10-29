//utilities and shit
import moment from 'moment'

/**
 * Takes an api date (a number in the format yyyyMMdd) and returns a renderable
 * string 
 * @param {*} apiDate a number in the format yyyyMMdd
 */
export function apiDateToFe(apiDate) {
  if (!apiDate) {
    return ""
  }
  let str = apiDate.toString()
  if (!/^(\d){8}$/.test(str)) {
    console.log("invalid date")
    return NaN
  }
  var y = str.substr(0, 4),
    m = str.substr(4, 2),
    d = str.substr(6, 2);
  var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(Number.parseInt(y), Number.parseInt(m - 1), Number.parseInt(d))
    .toLocaleDateString("en-US", options)
}

export function dateAsMoment(date) {
  return date ? moment(date, "YYYYMMDD") : null
}
export function momentAsDate(moment) {
  return moment ? Number.parseInt(moment.format("YYYYMMDD")) : null
}

export function makeNumTwoDigit(num) {
  return num < 10 ? "0" + num : num.toString()
}

export function dateAsYyyyMmDd(date) {
  function monthStr(date) {
    const monthNum = date.getMonth() + 1
    return makeNumTwoDigit(monthNum)
  }
  return Number.parseInt("" + date.getFullYear() + monthStr(date) + makeNumTwoDigit(date.getDate()))
}

export const RestrictionConversion = {
  getLabel: (value) => {
    switch (value) {
      case 'SPECIFIC_TIME':
        return 'Specific time'
      case 'ACTIVITY':
        return 'Activity'
      case 'BEFORE':
        return 'Before'
      case 'AFTER':
        return 'After'
      case 'BETWEEN':
        return "Between"
      case 'DURING':
        return 'During'
      case 'ENTIRELY':
        return 'Entirely'
      case 'CUSTOM_CONDITION':
        return 'Other...'
      case 'ALLOWED':
        return 'Allowed'
      case 'FORBIDDEN':
        return "Forbidden"
      case 'CUSTOM_ACTIVITY':
        return 'Other...'
    }
    if (Number.isInteger(value)) {
      if (value === 0) {
        return '12:00am'
      } else if (value === 12) {
        return '12:00pm'
      } else {
        return value < 12 ? value + ":00am" : ((value - 12) + ':00pm')
      }
    }
    return value
  },
  convertModelToPresentation: (modelValue) => {
    if (!modelValue || !modelValue.details) {
      return []
    }
    var presValue = modelValue.isNegation ? ['FORBIDDEN'] : ['ALLOWED']
    const interval = modelValue.details.interval
    if (modelValue.details.condition) {
      presValue.push(modelValue.details.condition)
    } else if (interval.begin.kind === interval.end.kind) {
      switch (interval.begin.kind) {
        case 'TIME':
          presValue.push('BETWEEN')
          presValue.push(interval.begin.spec)
          presValue.push(interval.end.spec)
          break;
        case 'ACTIVITY':
          presValue.push('DURING')
          // TODO: disambiguate custom vs standard here
          presValue.push(interval.begin.spec)
          break;
        case 'OPEN':
          presValue.push('ENTIRELY')
          break;
      }
    }
    else { // begin kind != end kind
      // We know that one end has to be open
      const closedIntervalSide = interval.begin.kind === 'OPEN' ? interval.end : interval.begin
      presValue.push(closedIntervalSide === interval.end ? 'BEFORE' : 'AFTER')
      presValue.push(closedIntervalSide.kind === 'TIME' ? 'SPECIFIC_TIME' : 'ACTIVITY')
      // TODO: maybe: disambiguate custom activity here
      presValue.push(closedIntervalSide.spec)
    }

    return presValue
  },
  convertPresentationToModel: (presValue) => {
    if (presValue.length === 0) {
      return null
    }
    const modelValue = {
      isNegation: presValue[0] === 'FORBIDDEN'
      , details: {}
    }

    var intervalBegin = null
    var intervalEnd = null
    function extractIntervalPointFromPres(presValue) {
      const kind = presValue[2] === 'SPECIFIC_TIME' ? 'TIME' : 'ACTIVITY'
      const spec = presValue[3] === 'CUSTOM_ACTIVITY' ? presValue[4] : presValue[3]
      return { kind, spec }
    }
    switch (presValue[1]) {
      case 'BEFORE':
        intervalBegin = { kind: 'OPEN', spec: null }
        intervalEnd = extractIntervalPointFromPres(presValue)
        break;
      case 'AFTER':
        intervalBegin = extractIntervalPointFromPres(presValue)
        intervalEnd = { kind: 'OPEN', spec: null }
        break;
      case 'BETWEEN':
        intervalBegin = { kind: 'TIME', spec: presValue[2] }
        intervalEnd = { kind: 'TIME', spec: presValue[3] }
        break;
      case 'DURING':
        intervalBegin = intervalEnd = {
          kind: 'ACTIVITY',
          spec: presValue[2] === 'CUSTOM_ACTIVITY' ? presValue[3] : presValue[2]
        }
        break;
      case 'ENTIRELY':
        intervalBegin = intervalEnd = { kind: 'OPEN', spec: null }
        break;
      case 'CUSTOM_CONDITION':
        modelValue.details.condition = presValue[2]
        break;
    }
    modelValue.details.interval = { begin: intervalBegin, end: intervalEnd }
    return modelValue
  },
  prettyPrintRestriction: (presValue) => {
    function optionToHuman(optVal) {
      // Hacky turd to deal with the fact that we share this when exporting (and dealing with
      // raw values) and when rendering the component (and dealing with {val, label} objects)
      const val = optVal.value ?? optVal
      switch (val) {
        case 'ALLOWED':
        case 'FORBIDDEN':
          return RestrictionConversion.getLabel(val)
        case 'SPECIFIC_TIME':
        case 'ACTIVITY':
        case 'ENTIRELY':
          return null
        case 'BEFORE':
        case 'AFTER':
        case 'BETWEEN':
        case 'DURING':
          return RestrictionConversion.getLabel(val).toLowerCase()
        case 'CUSTOM_CONDITION':
        case 'CUSTOM_ACTIVITY':
          return '...'
        default:
          return RestrictionConversion.getLabel(val)
      }
    }
    const readableStrs = presValue.map(opt => optionToHuman(opt)).filter(s => s)
    const betweenIndex = readableStrs.findIndex(s => s === 'between')
    if (betweenIndex > 0) {
      readableStrs.splice(betweenIndex + 2, 0, 'and')
    }
    return readableStrs.join(' ')
  }
}

export function prettyPrintTime(optTime, nullVal = null) {
  return optTime ? moment(optTime.hour + ':' + optTime.minute, "h:mm").format("h:mm a") : nullVal
}

export function prettyPrintDuration(optDuration) {
  var durationStr = ""
  if (optDuration && (optDuration.hour > 0 || optDuration.minute > 0)) {
    durationStr = "for "
    if (optDuration.hour !== 0) {
      durationStr += optDuration.hour
      durationStr += optDuration.hour > 1 ? " hours" : " hour"
      durationStr += optDuration.minute ? " and " : ""
    }
    if (optDuration.minute !== 0) {
      durationStr += optDuration.minute
      durationStr += optDuration.minute > 1 ? " minutes" : "minute"
    }
  }
  return durationStr
}

export const apiUrl = "https://mjsjd63379.execute-api.us-east-1.amazonaws.com/dev"

/**
 * Allows two numbers to be compared in a sort operation. If a > b returns positive;
 * if a < b returns negative; otherwise returns 0. I can't believe I have to write this
 * myself...
 */
export function numberComparer(a, b) {
  if (a < b) {
    return -1
  } else if (a > b) {
    return 1
  } else {
    return 0
  }
}

export const journalPromptFrequencies = {
  DAILY: "Daily",
  SPECIFIC_DOW: "Specific days",
  NEVER: "Never",
  RANDOMLY: "Sporadically"
}
