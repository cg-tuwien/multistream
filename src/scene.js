const moment = require('moment')

const setCookie = require('./setCookie')
const websocket = require('./websocket')
const templates = require('./templates')
const layout = require('./layout')

const conf = require('../conf.json')
let data

const doNotRemoveProperties = ['programIndex']

module.exports = {
  init (_data) {
    data = _data
    if (!('status' in data)) {
      data.status = {}
    }

    global.addEventListener('obsSceneChanged', event => {
      if (data.status.scene === event.detail.name) {
        global.sceneStatus = JSON.stringify(data.status)
        websocket.send({ status: data.status })
      }
    })
  },

  set (_status) {
    for (const k in data.status) {
      if (!(k in _status) && !doNotRemoveProperties.includes(k)) {
        _status[k] = null
      }
    }

    this.update(_status)
  },

  loadSlide (_status, data, callback) {
    if (typeof _status === 'string') {
      _status = {
        slide: _status
      }
    }

    this.update(_status)

    templates.renderSlide(document.getElementById('content'), _status.slide, data, () => {
      if (callback) {
        callback()
      }
    })
  },

  update (_status) {
    if ('slide' in _status && _status.slide === null) {
      _status.slideTitle = null
      _status.slideEndTime = null
    }

    if (_status.layout) {
      layout.changeLayout(_status.layout)
    }

    if (_status.sceneEndTime && _status.sceneEndTime instanceof Date) {
      _status.sceneEndTime = moment(_status.sceneEndTime).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    }

    if (_status.slideEndTime && _status.slideEndTime instanceof Date) {
      _status.slideEndTime = moment(_status.slideEndTime).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    }

    for (const k in _status) {
      if (_status[k] === null) {
        delete (data.status[k])
      } else {
        data.status[k] = _status[k]
      }
    }

    console.log(data.status)

    global.sceneStatus = JSON.stringify(data.status)

    if (global.obsstudio) {
      global.obsstudio.getCurrentScene(scene => {
        if (scene.name === data.status.scene) {
          websocket.send({ status: data.status })
          setCookie('status', JSON.stringify(data.status))
        }
      })
    } else if (conf.developmentMode) {
      websocket.send({ status: data.status })
      setCookie('status', JSON.stringify(data.status))
    }
  }
}
