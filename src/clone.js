module.exports = function clone (data) {
  return JSON.parse(JSON.stringify(data))
}
