const EventEmitter = require('events')
const cookie = require('cookie')

const exactTime = require('./exact-time')
const websocket = require('./websocket')
const randomId = require('./randomId')

class Communicator extends EventEmitter {
  constructor () {
    super()
    this.data = null
    this.streams = []
    this.stream = null
    this.cookies = null
    this.offlineMode = null
    this.cookieConnected = false

    websocket.on('error', (e) => {
      // can't connect
      if (this.data === null) {
        this.connectCookies()
      }

      document.cookie = 'serverOffline=1'
      if (!this.offlineMode) {
        this.offlineMode = true
        this.emit('offline-mode')
      }

      if (this.data) {
        this.data.isHost = 'offline'
        this.emit('update', this.data)
      }
    })

    websocket.on('open', (e) => {
      document.cookie = 'serverOffline=0'
      this.offlineMode = false
      this.emit('server-mode')

      websocket.send({livestreamId: this.id})

      if (this.data) {
        this.data.isHost = false
        this.emit('update', this.data)
      }
    })

    websocket.on('message', (e) => this.receiveMessage(e))

    this.cookies = cookie.parse(document.cookie)
    if (this.cookies.serverOffline === '1') {
      console.log('server might be down - use cookies')
      this.offlineMode = true
      this.emit('offline-mode')
      this.connectCookies()
    }

    if (this.cookies.livestreamId) {
      this.id = this.cookies.livestreamId
    } else {
      this.id = randomId(10)
      document.cookie = "livestreamId=" + this.id
    }
  }

  connectCookies () {
    if (!this.stream) {
      return
    }

    if (this.cookieConnected) {
      return
    }

    this.cookieConnected = true
    let status = this.cookies.status ? JSON.parse(this.cookies.status) : {}

    fetch('data/' + this.stream + '/data.json')
      .then(data => data.json())
      .then(json => {
        this.data = json
        this.data.id = this.stream
        this.data.isHost = 'offline'
        this.data.status = status

        this.emit('load', this.data)
        this.emit('update', this.data)
      })
      .catch(error => {
        console.error(error)

        this.data = {
          id: this.stream,
          status: {}
        }

        this.emit('load', this.data)
        this.emit('update', this.data)
      })

    this.connectCookiesInterval = global.setInterval(() => {
      let oldCookies = this.cookies

      this.cookies = cookie.parse(document.cookie)
      if (oldCookies.stream && this.cookies.stream !== oldCookies.stream) {
        global.clearInterval(this.connectCookiesInterval)
        return this.connectCookies()
      }

      if (oldCookies.status !== this.cookies.status) {
        this.data.status = this.cookies.status ? JSON.parse(this.cookies.status) : {}
        this.emit('update', this.data)
      }

    }, 100)
  }

  receiveMessage (e) {
    const _data = JSON.parse(e.data)
    console.log('recv', _data)

    if (_data.date) {
      exactTime.setServerTime(_data.date)
    }

    if (_data.streams) {
      this.streams = _data.streams
      console.log('streams:', _data.streams)
      this.emit('streams', _data.streams)

      return
    }

    // the server assigned us a (different) stream
    if (_data.id && this.stream !== _data.id) {
      this.stream = _data.id
      this.emit('set-stream', this.stream)
    }

    if (this.data === null) {
      this.emit('load', _data)
    }

    this.data = _data
    this.emit('update', this.data)
  }

  setStream (_stream) {
    this.stream = _stream
    document.cookie = "stream=" + this.stream
    this.emit('set-stream', this.stream)

    websocket.send({stream: this.stream})

    if (this.offlineMode) {
      this.connectCookies()
    }
  }
}

const communicator = new Communicator()
module.exports = communicator
