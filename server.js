const WebSocket = require('ws')
const moment = require('moment')

const updateSessions = require('./src/updateSessions.js')
const sessionLog = require('./src/sessionLog.js')
const randomId = require('./src/randomId.js')
const clone = require('./src/clone.js')

const conf = require('./conf.json')

const dataPath = 'data'
const sessions = {}
const clients = []

updateSessions(dataPath, sessions, err => {
  console.log('update')
  if (err) {
    console.error(err)
  }

  sessionLog.update(sessions,
    () => {
      const date = currentDate()
      const streamKeys = Object.keys(sessions)
      clients.forEach(conn => {
        let data = {}
        if (conn.stream && (conn.stream in sessions)) {
          data = clone(sessions[conn.stream])
        }

        data.date = date
        data.streams = streamKeys
        conn.send(JSON.stringify(data))
      })
    }
  )
})

const wss = new WebSocket.Server({
  port: conf.websocketPort
})

wss.on('connection', function connection (conn, req) {
  conn.ip = req.socket.remoteAddress
  conn.id = randomId()
  console.log(conn.id + ': New connection from', conn.ip)
  clients.push(conn)

  conn.on('message', function incoming (message) {
    message = JSON.parse(message)
    if (conf.developmentMode) {
      console.log(conn.id + ': recv msg ', message)
    }

    if ('livestreamId' in message) {
      conn.livestreamId = message.livestreamId

      for (const k in sessions) {
        if (sessions[k].livestreamId === conn.livestreamId) {
          conn.stream = k
          console.log(conn.id + ': is stream host for', conn.stream)
        }
      }
    }

    if ('stream' in message && message.stream !== null) {
      if (!(message.stream in sessions)) {
        console.log(conn.id + ': undefined stream', conn.stream)
        return
      }

      conn.stream = message.stream
    }

    if (message.host) {
      // unregister from previous stream
      for (const k in sessions) {
        if (sessions[k].livestreamId === conn.livestreamId) {
          sessions[k].livestreamId = null
        }
      }

      if (!conn.stream) {
        // assign first unclaimed stream
        for (const k in sessions) {
          if (!sessions[k].livestreamId) {
            conn.stream = k
            break
          }
        }
      }

      sessions[conn.stream].livestreamId = conn.livestreamId
      console.log(conn.id + ': register stream host', conn.livestreamId, 'for stream', conn.stream)
    }

    // This connection needs a stream - use the first
    if (!conn.stream) {
      conn.stream = Object.keys(sessions)[0]
    }

    if (message.monitor) {
      console.log(conn.id + ': client', conn.livestreamId, 'is monitor')
      conn.monitor = true

      let data = {}
      if (conn.stream) {
        data = clone(sessions[conn.stream])
        data.isHost = sessions[conn.stream].livestreamId === conn.livestreamId
      }
    }

    if (sessions[conn.stream].livestreamId === conn.livestreamId && (message.status || message.obsEvent)) {
      console.log(conn.id + ': client is host - updating status')

      if ('status' in message) {
        sessions[conn.stream].status = message.status
      }

      if (message.status) {
        sessionLog.write(conn.stream, message.status.scene + ',"' + message.status.title + '"')
      }

      if (message.status && message.status.title === 'The End') {
        sessionLog.close(conn.stream)
      }

      if ('obsEvent' in message) {
        sessionLog.write(conn.stream, message.obsEvent)
      }

      const data = clone(sessions[conn.stream])
      data.date = currentDate()

      clients.forEach((conn1, i) => {
        if (conn1.stream === conn.stream && conn1.monitor) {
          data.isHost = sessions[conn.stream].livestreamId === conn1.livestreamId
          conn1.send(JSON.stringify(data))
          if (conf.developmentMode) {
            console.log(conn1.id + ': send2', data)
          }
        }
      })
    }

    const data = clone(sessions[conn.stream])
    data.date = currentDate()
    data.isHost = sessions[conn.stream].livestreamId === conn.livestreamId
    conn.send(JSON.stringify(data))
    if (conf.developmentMode) {
      console.log(conn.id + ': send3', data)
    }
  })

  const data = {
    streams: Object.keys(sessions),
    date: currentDate()
  }
  conn.send(JSON.stringify(data))
  if (conf.developmentMode) {
    console.log(conn.id + ': send4', data)
  }

  conn.on('close', () => {
    console.log(conn.id + ': disconnect')
    const p = clients.indexOf(conn)

    if (p !== -1) {
      clients.splice(p, 1)
    }
  })
})

function currentDate () {
  return moment().utc().format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z'
}
