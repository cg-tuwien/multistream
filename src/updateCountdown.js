const moment = require('moment')

const exactTime = require('./exactTime')

module.exports = function updateCountdown () {
  const content = document.getElementById('countdown')
  if (!content) {
    return
  }

  const value = content.getAttribute('value')
  const secs = moment(value).diff(exactTime.getDate(), 'seconds')
  content.innerHTML = (secs <= 0 ? 'now' : 'in ' + Math.floor(secs / 60) + ':' + (secs % 60 < 10 ? '0' : '') + (secs % 60))
}
