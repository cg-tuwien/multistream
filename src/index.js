const cookie = require('cookie')
const async = {
  parallel: require('async/parallel')
}

const render = require('./render')
const scene = require('./scene')
const communicator = require('./communicator')

const theme = require('./theme')
const layout = require('./layout')

let data = null

const scenes = {
  Prologue: require('./startPrologue'),
  Epilogue: require('./startEpilogue'),
  Break: require('./startBreak'),
  Video: require('./startVideo'),
  Introduction: require('./startIntroduction'),
  FastForward: require('./startFastForward'),
  'Sponsored By': require('./startSponsoredBy'),
  Template: require('./startTemplate'),
  'OBS Dock': require('./startOBSDock'),
  StreamMonitor: require('./startStreamMonitor'),
  Test: require('./startTest'),
  'Continue Discussion': require('./startContinueDiscussion')
}

communicator.on('load', _data => {
  async.parallel(
    [
      done => theme.init(_data, done),
      done => layout.init(_data, done)
    ],
    () => global.setTimeout(() => load2(_data), 0)
  )
})

function load2 (_data) {
  data = _data

  render(data)
  scene.init(data)
  theme.render()

  if (global.currentScene in scenes) {
    scenes[global.currentScene](data, load3)
  } else {
    console.error('NO CURRENT SCENE!!!')
    load3()
  }
}

function load3 () {
  layout.render()
}

communicator.on('streams', streams => {
  if (!communicator.stream) {
    communicator.setStream(streams[0])
  }
})

communicator.on('set-stream', stream => {
  console.log('set stream', stream)
})

// Read session start form URL
const urlString = window.location.href
const url = new URL(urlString)
const _stream = url.searchParams.get('stream')
if (_stream) {
  communicator.setStream(_stream)
} else {
  const cookies = cookie.parse(document.cookie)
  communicator.setStream(cookies.stream || 'stream1')
}
