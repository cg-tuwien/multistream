const moment = require('moment')
const escHtml = require('escape-html')
const sprintf = require('extsprintf').sprintf

const communicator = require('./communicator')
const exactTime = require('./exactTime')
const websocket = require('./websocket')

const conf = require('../conf.json')

const registerButton = document.createElement('input')
registerButton.type = 'submit'
registerButton.name = 'register'
registerButton.value = 'Register as stream host'
registerButton.className = 'button'

class Monitor {
  constructor (data, callback) {
    communicator.on('streams', streams => this.updateStreamSelector(streams))
    this.updateStreamSelector(communicator.streams)

    communicator.on('update', data => this.update(data))
    communicator.on('offline-mode', () => this.setOfflineMode())
    communicator.on('server-mode', () => this.setServerMode())
    communicator.on('set-stream', () => this.update())

    if (communicator.offlineMode === true) {
      this.setOfflineMode()
    } else if (communicator.offlineMode === false) {
      this.setServerMode()
    }

    window.setInterval(this.updateClocks, 100)

    global.monitorUpdate = () => this.monitorUpdate()
    global.monitorProgramNext = () => this.monitorProgramNext()

    const register = document.getElementById('register')
    register.onsubmit = () => {
      websocket.send({ host: true, stream: register.elements.stream.value })

      if (registerButton && registerButton.parentNode) {
        registerButton.parentNode.removeChild(registerButton)
      }

      return false
    }

    websocket.send({ monitor: true })
    callback()
  }

  monitorProgramNext () {
    const register = document.getElementById('register')

    register.elements['status.programIndex'].value++

    this.monitorUpdate()
  }

  monitorUpdate () {
    const data = communicator.data
    if (!data.status) {
      data.status = {}
    }

    const register = document.getElementById('register')

    if (register.elements.stream.value !== communicator.stream) {
      communicator.setStream(register.elements.stream.value)
    }

    Array.from(register.elements).forEach(el => {
      const m = el.name.match(/^status\.(.*)$/)
      if (m) {
        data.status[m[1]] = el.value
      }
    })

    websocket.send({ status: data.status })
    document.cookie = 'status=' + JSON.stringify(data.status)
  }

  setOfflineMode () {
    const register = document.getElementById('register')

    const streamSelect = register.elements.stream
    if (streamSelect.nodeName === 'SELECT') {
      const input = document.createElement('input')
      input.id = 'stream'
      input.onchange = () => this.monitorUpdate()

      streamSelect.parentNode.insertBefore(input, streamSelect)
      streamSelect.parentNode.removeChild(streamSelect)
    }

    if (registerButton.parentNode) {
      registerButton.parentNode.removeChild(registerButton)
    }
  }

  setServerMode () {
    const register = document.getElementById('register')

    const streamSelect = register.elements.stream
    if (streamSelect.nodeName === 'SELECT') {
      streamSelect.onchange = () => this.monitorUpdate()
    } else {
      const input = document.createElement('select')
      input.id = 'stream'
      input.onchange = () => this.monitorUpdate()

      streamSelect.parentNode.insertBefore(input, streamSelect)
      streamSelect.parentNode.removeChild(streamSelect)
    }

    this.showRegisterButton()
  }

  showRegisterButton () {
    if (global.obsstudio || conf.developmentMode) {
      const register = document.getElementById('register')
      register.appendChild(registerButton)
    } else if (registerButton.parentNode) {
      registerButton.parentNode.removeChild(registerButton)
    }
  }

  update () {
    const data = communicator.data
    const register = document.getElementById('register')

    if (register.elements.stream.nodeName === 'SELECT') {
      const select = register.elements.stream
      while (select.firstChild) {
        select.removeChild(select.firstChild)
      }

      communicator.streams.forEach(stream => {
        const option = document.createElement('option')
        option.value = stream
        option.appendChild(document.createTextNode(stream))
        if (stream === communicator.stream) {
          option.selected = true
        }
        select.appendChild(option)
      })
    } else {
      register.elements.stream.value = communicator.stream
    }

    if (!data) {
      return
    }

    if (data.isHost) {
      if (registerButton.parentNode) {
        registerButton.parentNode.removeChild(registerButton)
      }
    } else {
      this.showRegisterButton()
    }

    document.getElementById('dock-logo').src = 'themes/' + (data.session.theme ? data.session.theme : 'default') + '/logo.png'
    document.getElementById('session-title').innerHTML = data.session ? (data.session.title || '') : ''
    document.getElementById('scene').innerHTML = data.status ? (data.status.scene || '') : ''
    document.getElementById('slide').innerHTML = data.status ? (data.status.slide || '') : ''
    document.getElementById('sceneNext').innerHTML = data.status ? (data.status.sceneNext || '') : ''
    document.getElementById('slideTitle').innerHTML = data.status ? (data.status.slideTitle || '') : ''
    document.getElementById('hasHost').innerHTML = data.isHost ? (data.isHost === 'offline' ? 'offline mode' : 'I am host') : (data.ip ? 'yes' : 'no')
    if (data.isHost) {
      document.getElementById('programIndex').innerHTML = '<select name="status.programIndex" onchange="monitorUpdate()">' + allProgramPoints(data, data.status && 'programIndex' in data.status ? data.status.programIndex : 0) + '</select>' +
        '<button name="status.programNext" onClick="monitorProgramNext()">⇥</button>'
    } else {
      document.getElementById('programIndex').innerHTML = data.status && data.status.programIndex !== undefined ? escHtml(data.session.program[data.status.programIndex].title) : ''
    }

    if (document.getElementById('data')) {
      document.getElementById('data').innerHTML = ''
      document.getElementById('data').appendChild(document.createTextNode(JSON.stringify(data, null, '  ')))
    }
  }

  updateStreamSelector (streams) {
    const register = document.getElementById('register')
    const select = register.elements.stream

    streams.forEach(k => {
      const option = document.createElement('option')
      option.value = k
      option.appendChild(document.createTextNode(k))

      if (k === communicator.stream) {
        option.selected = true
      }

      select.appendChild(option)
    })
  }

  updateClocks () {
    const data = communicator.data

    exactTime.getDate((err, date) => {
      if (err) {
        console.log(err.stack)
      }
      document.getElementById('date').innerHTML = moment(date).format('ddd, D. MMM YYYY, H:mm:ss')
      if (data && data.status && data.status.sceneEndTime) {
        const rest = new Date(data.status.sceneEndTime) - new Date(date)
        if (rest < 0) {
          document.getElementById('countdown').innerHTML = '(please wait)'
        } else {
          document.getElementById('countdown').innerHTML = sprintf('%s:%02d.%1d (%s)', Math.floor(rest / 60000), (rest % 60000) / 1000, (rest % 1000) / 100, moment(data.status.sceneEndTime).format('H:mm:ss'))
        }
      } else {
        document.getElementById('countdown').innerHTML = ''
      }
    })
  }
}

module.exports = function startOBSDock (data, callback) {
  // eslint-disable-next-line no-new
  new Monitor(data, callback)
}

function allProgramPoints (data, index) {
  if (data.session && data.session.program && Array.isArray(data.session.program)) {
    return data.session.program
      .map((point, i) => '<option value="' + i + '"' + (parseInt(index) === i ? ' selected' : '') + '>' + (point.id ? escHtml(point.id) + ': ' : '') + escHtml(point.title) + '</option>')
      .join('')
  }

  return ''
}
