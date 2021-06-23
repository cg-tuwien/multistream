const VideoPlaylist = require('video-playlist')
const async = {
  eachOf: require('async/eachOf'),
  parallel: require('async/parallel')
}
const scene = require('./scene.js')
const exactTime = require('./exactTime')
const templates = require('./templates')
const clone = require('./clone.js')
const centerHighlighted = require('./centerHighlighted')

const conf = require('../conf.json')

const defaultIntroDuration = 5 // seconds
let playlist

module.exports = function startFastForward (data, callback) {
  if (!data || !data.session || !data.session.program) {
    return callback()
  }

  let talkIndex = 0
  async.parallel(
    [
      // TODO: remove the line below, to use the rendered content from layout (but this will happen later) - also remove fast_forwardSidebarTemplate from layoutTemplates.json
      (done) => templates.render(document.getElementById('sidebar_container'), 'playlist_fastforward', data, done),
      (done) => {
        async.eachOf(data.session.program,
          (entry, index, done) => {
            const _data = clone(data)
            _data.index = index
            _data.talkIndex = talkIndex
            _data.entry = data.session.program[index]
            templates.render(
              null, 'fastforward-introduction', _data,
              (err, result) => {
                entry.introSlide = result
                done(err)
              }
            )

            if ('authors' in entry) {
              talkIndex++
            }
          },
          done
        )
      }
    ],
    (err) => load2(err, data, callback)
  )
}

function load2 (err, data, callback) {
  if (err) {
    console.log(err.stack)
  }
  const programList = document.querySelectorAll('#program > li')
  const _playlist = data.session.program.map(
    (entry, index) => {
      if (!entry.fastForwardFile) {
        return {
          videoDuration: 0
        }
      }

      const result = {
        index,
        video: '../data/' + data.id + '/' + entry.fastForwardFile,
        videoDuration: entry.fastForwardDuration
      }

      const introDuration = 'fastForwardIntroDuration' in entry
        ? entry.fastForwardIntroDuration
        : 'fastForwardIntroDuration' in data.session
          ? data.session.fastForwardIntroDuration
          : defaultIntroDuration

      if (introDuration) {
        result.pauses = [
          {
            time: 0,
            duration: introDuration,
            title: entry.introSlide
          }
        ]
      }

      return result
    }
  ).filter(entry => entry)

  playlist = new VideoPlaylist(
    document.getElementById('content'),
    _playlist,
    {
      controls: conf.developmentMode
    }
  )

  playlist.on('pauseStart', (video, entry) => {
    if (entry.title) {
      document.getElementById('content').classList.add('show-title-slide')
    }
  })

  playlist.on('pauseEnd', (video, entry) => {
    if (entry.title) {
      document.getElementById('content').classList.remove('show-title-slide')
    }
  })

  playlist.on('next', video => {
    const index = _playlist.indexOf(video)
    const entry = data.session.program[index]
    programList.forEach(program => program.classList.remove('highlighted'))
    if (programList[index]) {
      programList[index].classList.add('highlighted')
    }

    scene.set({
      scene: 'Fast Forward',
      slide: 'video',
      slideTitle: entry.title + (entry.presenter && entry.presenter.length ? ' by ' + entry.presenter.map(p => p.name).join(', ') : ''),
      sceneEndTime: new Date(exactTime.getDate().getTime() + (playlist.duration - playlist.currentTime) * 1000),
      slideEndTime: new Date(exactTime.getDate().getTime() + (playlist.currentDuration - playlist.currentCurrentTime) * 1000)
    }, data)

    centerHighlighted(document.querySelector('#sidebar_container'))
  })

  const recalc = () => {
    const update = {
      sceneEndTime: new Date(exactTime.getDate().getTime() + (playlist.duration - playlist.currentTime) * 1000),
      slideEndTime: new Date(exactTime.getDate().getTime() + (playlist.currentDuration - playlist.currentCurrentTime) * 1000)
    }

    scene.update(update, data)
  }

  playlist.on('loadedmetadata', recalc)
  playlist.on('seeked', recalc)
  playlist.on('seeking', recalc)

  playlist.play()
  callback()
}
