const EventEmitter = require('events')

const conf = require('../conf.json')

let closing = false

class Websocket extends EventEmitter {
  constructor () {
    super()
    this.ws = null
    this.wsQueue = []
    this.closing = false

    var loc = window.location, uri;

    if (loc.protocol === "https:") {
        uri = "wss:";
    } else {
        uri = "ws:";
    }

    uri += conf.websocketPath

    this.ws = new global.WebSocket(uri)

    this.ws.onopen = () => {
      this.wsQueue.forEach(data => this.ws.send(data))
      this.wsQueue = null

      this.emit('open')
    }

    this.ws.onerror = (e) => {
      if (closing) {
        return
      }

// TODO: remove next lines
      let div = document.getElementById('error')
      if (div) {
        div.className = 'hasError'
        div.innerHTML = 'No connection to server - try refresh'
      }

      this.emit('error', e)
    }

    this.ws.onclose = (e) => {
      if (closing) {
        return
      }

// TODO: remove next lines
      let div = document.getElementById('error')
      if (div) {
        div.className = 'hasError'
        div.innerHTML = 'Connection to server lost - try refresh'
      }

      this.emit('close', e)
    }

    this.ws.onmessage = (e) => {
      this.emit('message', e)
    }
  }

  send (data) {
    if (this.ws.readyState === this.ws.CONNECTING) {
      return this.wsQueue.push(JSON.stringify(data))
    }

    if (conf.developmentMode) {
      console.log('send', data)
    }

    this.ws.send(JSON.stringify(data))
  }
}

window.onbeforeunload = () => {
  closing = true
}

const websocket = new Websocket()
module.exports = websocket
