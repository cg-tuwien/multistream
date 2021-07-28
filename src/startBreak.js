const moment = require('moment')
const scene = require('./scene.js')
const updateCountdown = require('./updateCountdown.js')

const audio = require('./audioControls')
const exactTime = require('./exactTime')

module.exports = function startBreak (data, callback) {
  global.fetch('../themes/' + (data.session.theme || 'default') + '/break.json')
    .then(response => response.json())
    .then(json => {
      loadBreak(json)
    })

  function loadBreak (schedule) {
    // Total break duration in ms
    const duration = timeStampToMs(schedule.duration)

    // Accumulated time for slide timeouts
    let timeoutSum = 0

    // Start time of break
    const start = exactTime.getDate().getTime()

    // Get start time of next session (URL parameter has to be set to correct stream!)
    const nextSessionStart = exactTime.getDate().getTime() + duration

    // Pass break end to data
    data.session.breakEnd = new Date(nextSessionStart)

    // Get actual duration
    const actualDuration = nextSessionStart - start

    // Setup and configure countdown
    const countdownDom = document.getElementById('countdown')
    if (countdownDom) {
      countdownDom.setAttribute('value', moment(new Date(nextSessionStart).getTime()).format())
      console.log('Test')
    }

    console.log(data)
    window.setInterval(updateCountdown, 1000)

    // Setup and configure music
    const music = document.getElementById('intro_audio')

    // Play first music track
    if (Object.prototype.hasOwnProperty.call(schedule.music, 'tracks' && schedule.music.tracks.length > 0)) {
      const track1 = schedule.music.tracks[0]
      setTimeout(function () {
        music.src = '../music/' + track1.file
        music.play()
        data.session.music = track1
      }, actualDuration - timeStampToMs(track1.start))

      // Play second track after the first one has ended
      music.addEventListener('ended', function () {
        this.src = '../music/' + schedule.music.tracks[1].file + '?nocache=' + new Date().getTime()
        this.play()
        data.session.music = schedule.music.tracks[1]
      })
    }

    // Set music fadeout
    setTimeout(() => audio.fadeOut(music), actualDuration - timeStampToMs(schedule.music.fadeDuration))

    // Load all slides
    let firstSlide = true
    for (const index in schedule.slides) {
      const slide = schedule.slides[index]
      if (firstSlide) {
        // First slide without timeout (loaded at startup) and with scene information
        scene.loadSlide({
          layout: slide.layout || data.session.breakLayout,
          scene: 'Coffee Break',
          sceneEndTime: new Date(nextSessionStart),
          slide: slide.slide,
          slideTitle: slide.title,
          slideEndTime: new Date(start + timeoutSum + timeStampToMs(slide.duration))
        }, data)
        timeoutSum += timeStampToMs(slide.duration)
        firstSlide = false
      } else {
        // Remaining slides with corresponding timeouts
        setTimeout(() => scene.loadSlide({
          layout: slide.layout || data.session.breakLayout,
          slide: slide.slide,
          slideTitle: slide.title,
          slideEndTime: new Date(start + timeoutSum + timeStampToMs(slide.duration))
        }, data, () => {}), timeoutSum)
        timeoutSum += timeStampToMs(slide.duration)
      }
    }

    callback()
  }

  function timeStampToMs (timestamp) {
    return moment(timestamp, 'HH:mm:ss').diff(moment().startOf('day'), 'milliseconds')
  }
}
