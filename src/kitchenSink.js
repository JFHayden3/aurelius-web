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
  return Number.parseInt(moment.format("YYYYMMDD"))
}

export function dateAsYyyyMmDd(date) {
  function makeNumTwoDigit(num) {
    return num < 10 ? "0" + num : num.toString()
  }
  function monthStr(date) {
    const monthNum = date.getMonth() + 1
    return makeNumTwoDigit(monthNum)
  }
  return Number.parseInt("" + date.getFullYear() + monthStr(date) + makeNumTwoDigit(date.getDate()))
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
