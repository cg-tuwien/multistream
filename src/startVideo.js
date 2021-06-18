const VideoPlaylist = require('video-playlist')
const async = {
  eachOf: require('async/eachOf'),
  each: require('async/each')
}

const scene = require('./scene.js')
const exactTime = require('./exactTime')
const centerHighlighted = require('./centerHighlighted')
const templates = require('./templates')
const layout = require('./layout')
const clone = require('./clone.js')
const playApplause = require('./playApplause.js')

const conf = require('../conf.json')

module.exports = function startVideo (data, callback) {
  const urlString = window.location.href
  const url = new URL(urlString)
  const index = url.searchParams.get('index') || (data.status ? data.status.programIndex || 0 : 0)

  start1(data, url, index, callback)
}

function start1 (data, url, index, callback) {
  if (!data || !data.session || !data.session.program || !data.session.program[index]) {
    return callback()
  }

  const entry = data.session.program[index]

  if (!entry.videoFile && !entry.videoPlaylist) {
    scene.set({
      scene: 'Video',
      sceneEndTime: null,
      slide: 'no video defined!',
      slideTitle: entry.title
    }, data)
    return callback()
  }

  scene.set({
    scene: 'Video',
    sceneEndTime: null,
    programIndex: index,
    slide: null,
    slideIndex: 0,
    slideTitle: entry.title
  })

  let _playlist

  if (entry.videoFile) {
    _playlist = [
      {
        video: 'data/' + data.id + '/' + entry.videoFile
      }
    ]
  } else if (entry.videoPlaylist) {
    _playlist = entry.videoPlaylist.map(subentry => {
      subentry.video = subentry.video ? 'data/' + data.id + '/' + subentry.video : null
      return subentry
    })
  }

  renderTitles(_playlist, entry, data, () => start2(_playlist, data, entry, url, index, callback))
}

function start2 (_playlist, data, entry, url, index, callback) {
  // Play applause if provided in url parameter
  const applause = (url.searchParams.has('applause') ? url.searchParams.get('applause') : entry.applause) || 0
  const applauseEl = new Audio()
  applauseEl.src = 'data/applause_talk.mp3'

  if (applause) {
    applauseEl.onloadedmetadata = () => {
      _playlist[0].pauses[0].duration = applauseEl.duration
      playlist.update()
    }

    _playlist[0].pauses = [
      {
        time: 'end',
        id: 'applause'
      }
    ]
  }

  const playlist = new VideoPlaylist(
    document.getElementById('content'),
    _playlist,
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

  playlist.on('endedAll', () => {
    playlist.close()
    if (entry.videoContinueNext) {
      const index = data.session.program.indexOf(entry) + 1

      start1(data, url, index, () => {})

      layout.render()
    }
  })

  global.addEventListener('obsSceneChanged', event => {
    playlist.pause()
    playlist.currentTime = 0
    playlist.play()
    console.log('restarting video after transition')

    scene.update({
      slideIndex: 0,
      sceneEndTime: recalc(playlist),
      videoEndTime: recalc(playlist)
    }, data)
  })

  const updateEndTime = () => scene.update({
    sceneEndTime: recalc(playlist),
    videoEndTime: recalc(playlist)
  }, data)

  playlist.on('playing', updateEndTime)
  playlist.on('loadedmetadata', updateEndTime)
  playlist.on('seeking', updateEndTime)
  playlist.on('seeked', updateEndTime)
  playlist.on('next', (playlistEntry) => {
    const slideIndex = _playlist.indexOf(playlistEntry)

    scene.update({
      slideIndex,
      slideTitle: playlistEntry.title
    })

    const programList = document.querySelectorAll('#playlist > li')
    if (programList && programList.length) {
      programList.forEach(program => {
        if (program.getAttribute('data-playlist-index') === slideIndex) {
          program.classList.add('highlighted')
        } else {
          program.classList.remove('highlighted')
        }
      })

      centerHighlighted(document.querySelector('#sidebar_container'))
    }
  })

  scene.update({
    scene: 'Video',
    sceneEndTime: null,
    videoPlaylist: _playlist,
    videoEndTime: null,
    programIndex: index,
    slide: null,
    slideIndex: 0,
    slideTitle: entry.title
  })

  playlist.play()
  callback()
}

function recalc (playlist) {
  return new Date(exactTime.getDate().getTime() + (playlist.duration - playlist.currentTime) * 1000)
}

function renderTitles (playlist, entry, data, callback) {
  async.eachOf(playlist,
    (playlistEntry, index, done) => {
      const _data = clone(data)
      _data.index = index
      _data.talkIndex = index
      _data.entry = playlist[index]

      if (playlistEntry.pauses) {
        async.each(playlistEntry.pauses,
          (pause, done) => {
            if (pause.template) {
              return templates.render(
                null, pause.template, _data,
                (err, result) => {
                  if (err) {
                    console.log(err.stack)
                  }
                  pause.title = result
                  done()
                }
              )
            }

            done()
          },
          done
        )
      } else {
        done()
      }
    },
    callback
  )
}
