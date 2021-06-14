module.exports = function randomId (chars = 4) {
  return Math.random().toString(36).substr(2, chars)
}
