const cookie = require('cookie')

const defaultOptions = {
  maxAge: 60 * 60 * 24 * 7, // 1 week
  path: '/'
}

module.exports = function setCookie (key, value, options = {}) {
  for (const k in defaultOptions) {
    if (!(k in options)) {
      options[k] = defaultOptions[k]
    }
  }

  document.cookie = cookie.serialize(key, value, options)
}
