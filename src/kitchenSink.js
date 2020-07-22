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
  return (y + "-" + m + "-" + d);
}