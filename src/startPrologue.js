const moment = require('moment')

const scene = require('./scene.js')
const getStartTime = require('./getStartTime.js')
const updateCountdown = require('./updateCountdown.js')
const audio = require('./audioControls')
const exactTime = require('./exactTime')
const websocket = require('./websocket')
const templates = require('./templates')

module.exports = function startPrologue (data, callback) {
  let sceneName = 'Prologue'

  global.fetch('themes/' + (data.session.theme || 'default') + '/prologue.json')
    .then(response => response.json())
    .then(json => {
      loadProlog(json)
    })

  function loadProlog (schedule) {
    // Total prolog duration in ms
    const duration = timeStampToMs(schedule.duration)

    // Accumulated time for slide timeouts
    let timeoutSum = 0

    // Get session start time
    let sessionStart

    if (data && data.session && data.session.start) {
      sessionStart = new Date(new Date(data.session.start).getTime() - duration)
    }

    const time = getStartTime()

    if (time === 'now') {
      sessionStart = exactTime.getDate()
      sceneName += ' Now'
    } else if (time != null) {
      // Prologue starts 2min before session
      sessionStart = new Date(new Date(time).getTime() - duration)
    }

    data.session.start = moment(sessionStart.getTime() + duration).format()

    // Render program preview
    templates.render(
      document.querySelector('#bottom_container'),
      'countdown',
      data,
      () => {}
    )

    // Setup and configure countdown
    const countdownDom = document.getElementById('countdown')
    if (countdownDom) {
      countdownDom.setAttribute('value', moment(new Date(sessionStart).getTime() + duration).format())
    }
    window.setInterval(updateCountdown, 1000)
    updateCountdown()

    // Calculate remaining time until start
    const now = exactTime.getDate()
    const remainingTime = sessionStart.getTime() - now

    // Setup and configure music
    const music = document.getElementById('intro_audio')
    music.src = 'music/' + schedule.music.tracks[0].file
    music.currentTime = timeStampToMs(schedule.music.tracks[0].in) / 1000
    setTimeout(() => audio.fadeOut(music), remainingTime + duration - timeStampToMs(schedule.music.fadeDuration) - timeStampToMs(schedule.music.tracks[0].end))
    // Start music 5 min before session start
    setTimeout(() => music.play(), remainingTime)
    // Add music to data for display on "currently_playing" slide
    data.session.music = schedule.music.tracks[0]

    // Load all slides
    let firstSlide = true
    for (const index in schedule.slides) {
      const slide = schedule.slides[index]
      if (firstSlide) {
        // First slide without timeout (loaded at startup) and with scene information
        scene.loadSlide({
          programIndex: 0,
          scene: sceneName,
          sceneNext: 'Session Opening',
          sceneEndTime: new Date(sessionStart.getTime() + duration),
          telePrompt: data.session.prologueTelePrompt || '',
          layout: slide.layout || data.session.prologueLayout,
          slide: slide.slide,
          slideTitle: slide.title,
          slideEndTime: new Date(sessionStart.getTime() + timeoutSum + timeStampToMs(slide.duration))
        }, data)
        timeoutSum += timeStampToMs(slide.duration)
        firstSlide = false
      } else {
        // Remaining slides with corresponding timeouts
        setTimeout(() => scene.loadSlide({
          layout: slide.layout || data.session.prologueLayout,
          slide: slide.slide,
          slideTitle: slide.title,
          slideEndTime: new Date(sessionStart.getTime() + timeoutSum + timeStampToMs(slide.duration))
        }, data, () => {}), remainingTime + timeoutSum)
        timeoutSum += timeStampToMs(slide.duration)
      }
    }

    callback()
  }

  function timeStampToMs (timestamp) {
    return moment(timestamp, 'HH:mm:ss').diff(moment().startOf('day'), 'milliseconds')
  }

  // Listen for obs stream start and log it
  global.addEventListener('obsStreamingStarted', function (event) {
    const obsEvent = event.type
    websocket.send({ obsEvent })
  })

  // Manual switching between scenes (for debugging)
  document.addEventListener('keydown', (event) => {
    switch (event.key) {
      case '1':
        scene.loadSlide({
          slide: 'welcome',
          layout: 'full'
        }, data)
        break
      case '2':
        scene.loadSlide({
          slide: 'programday',
          layout: 'full'
        }, data)
        break
      case '3':
        scene.loadSlide({
          slide: 'news',
          layout: 'full'
        }, data)
        break
      case '4':
        scene.loadSlide({
          slide: 'program_chairs',
          layout: 'full'
        }, data)
        break
      case '5':
        scene.loadSlide({
          slide: 'local_organization',
          layout: 'full'
        }, data)
        break
      case '6':
        scene.loadSlide({
          slide: 'currently_playing',
          layout: 'full'
        }, data)
        break
      case '7':
        scene.loadSlide({
          slide: 'sponsors',
          layout: 'full'
        }, data)
        break
      case '8':
        scene.loadSlide({
          slide: 'social_media',
          layout: 'full'
        }, data)
        break
      case '9':
        scene.loadSlide({
          slide: 'signation',
          layout: 'fullscreen'
        }, data)
        break
      case '0':
        scene.loadSlide({
          slide: 'image',
          layout: 'full'
        }, data)
        break
      case 'a':
        scene.loadSlide({
          slide: 'pacific_vis',
          layout: 'full'
        }, data)
    }
  })
}
