const moment = require('moment')
const escHtml = require('escape-html')
const sprintf = require('extsprintf').sprintf
const VideoPlaylist = require('video-playlist')

const communicator = require('./communicator')
const exactTime = require('./exactTime')
const websocket = require('./websocket')
const playApplause = require('./playApplause')

const conf = require('../conf.json')
let playlist

const applauseEl = new Audio()
applauseEl.src = 'data/applause_talk.mp3'

class Monitor {
  constructor (data, callback) {
    communicator.on('update', data => this.update(data))
    communicator.on('set-stream', () => this.update())
    this.update()

    window.setInterval(this.updateClocks, 100)

    websocket.send({ monitor: true })
    callback()
  }

  update () {
    const data = communicator.data

    if (!data) {
      return
    }

    document.getElementById('session-title').innerHTML = data.session ? (data.session.title || '') : ''
    document.getElementById('scene').innerHTML = data.status ? (data.status.scene + (data.status.slideTitle ? ' / ' + data.status.slideTitle : '') || '') : ''
    document.getElementById('sceneNext').innerHTML = data.status ? (data.status.sceneNext || '') : ''
    if (data.status) {
      document.getElementById('content').innerHTML = ''

      if (data.status.telePrompt) {
        document.getElementById('content').innerHTML = '<div class="telePrompt">' + data.status.telePrompt + '</div>'
      }

      if (data.status.scene && data.status.scene.match(/^Prologue/)) {
        document.getElementById('programIndex').innerHTML = 'Prologue'
      } else if (data.status.scene && data.status.scene.match(/^Epilogue/)) {
        document.getElementById('programIndex').innerHTML = 'Epilogue'
      } else if ((data.status.scene && data.status.scene.match(/^Live Zoom/)) || (data.status.scene && data.status.scene.match(/^Introduction/))) {
        document.getElementById('content').innerHTML = '<div id="you_are_live"><div id="status">You are</div><div id="live_container">LIVE</div></div>'
      } else {
        document.getElementById('programIndex').innerHTML = data.status && data.status.programIndex !== undefined ? escHtml(data.session.program[data.status.programIndex].title) : ''
      }
    } else {
      document.getElementById('programIndex').innerHTML = ''
    }

    if (document.getElementById('data')) {
      document.getElementById('data').innerHTML = ''
      document.getElementById('data').appendChild(document.createTextNode(JSON.stringify(data, null, '  ')))
    }

    if (data.status && data.status.videoPlaylist && data.status.videoEndTime) {
      document.getElementById('content').innerHTML = '<div id="video_container"></div>'
      if (playlist) {
        playlist.close()
      }

      playlist = new VideoPlaylist(
        document.getElementById('video_container'),
        data.status.videoPlaylist,
        {
          controls: conf.developmentMode
        }
      )

      playlist.on('pauseStart', (entry, pause) => {
        if (pause.applause) {
          playApplause(pause)
        } else if (pause.id === 'applause') {
          applauseEl.play()
        }

        if (pause.title) {
          document.getElementById('content').classList.add('show-title-slide')
        }
      })

      playlist.on('pauseEnd', (entry, pause) => {
        if (pause.title) {
          document.getElementById('content').classList.remove('show-title-slide')
        }
      })

      playlist.on('action', (entry, action) => {
        if (action.applause) {
          playApplause(action)
        } else if (action.id === 'applause') {
          applauseEl.play()
        }
      })

      const time = new Date(data.status.videoEndTime) - new Date().getTime()
      if (time > 0) {
        // TODO: currentTime should be settable before play()
        // see https://github.com/plepe/video-playlist/issues/1
        playlist.play()
        playlist.currentTime = playlist.duration - time / 1000
      }
    } else if (playlist) {
      playlist.close()
    }
  }

  updateClocks () {
    const data = communicator.data

    exactTime.getDate((err, date) => {
      if (err) {
        console.log(err)
      }
      document.getElementById('date').innerHTML = moment(date).format('H:mm:ss')
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

module.exports = function startMonitor (data, callback) {
  // eslint-disable-next-line no-new
  new Monitor(data, callback)
}
