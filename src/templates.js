const Twig = require('twig')

const conf = require('../conf.json')
const randomId = require('./randomId.js')
const columnize = require('./columnize')

const templates = {}
const templates_callback = {}

const cacheId = conf.developmentMode ? randomId() : require('../cache_id.json')

function _render (dom, id, data, callback) {
  let result = templates[id].render(data)
  if (dom) {
    dom.innerHTML = result

    if (dom.classList.contains('columnize')) {
      columnize(dom)
    }
  }

  if (callback) {
    callback(null, result)
  }

  return
}

module.exports = {
  render (dom, id, data, callback) {
    if ((!dom && !callback) || id === 'none') {
      return callback ? callback(null) : null
    }

    if (id in templates) {
      return _render(dom, id, data, callback)
    }

    if (id in templates_callback) {
      return templates_callback[id].push({dom, data, callback})
    }

    templates_callback[id] = [{dom, data, callback}]

    Twig.twig({
      id,
      href: 'templates/' + id + '.html?' + cacheId,
      async: true,
      load: (template) => {
        templates[id] = template

        templates_callback[id].forEach(p => {
          _render(p.dom, id, p.data, p.callback)
        })

        delete templates_callback[id]
      }
    })
  }
}
