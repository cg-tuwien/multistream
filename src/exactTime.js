let timeOffset = 0

module.exports = {
  getDate (callback) {
    const date = new Date(new Date().getTime() + timeOffset)

    if (callback) {
      callback(null, date)
    }

    return date
  },

  setServerTime (date) {
    timeOffset = new Date(date).getTime() - new Date().getTime()
  }
}
