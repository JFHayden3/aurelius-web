//utilities and shit

/**
 * Takes an api date (a number in the format yyyyMMdd) and returns a renderable
 * string 
 * @param {*} apiDate a number in the format yyyyMMdd
 */
export function apiDateToFe(apiDate) {
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
