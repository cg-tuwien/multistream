const moment = require('moment')
const scene = require('./scene.js')
const exactTime = require('./exact-time')
const audio = require('./audioControls')
const conference_calendar = require('./conference_calendar.js')

module.exports = function startEpilogue (data, callback) {
  global.fetch('themes/' + (data.session.theme || 'default') + '/epilogue.json')
    .then(response => response.json())
    .then(json => {
      loadEpilog(json)
    })

  function loadEpilog (schedule) {
    // Start time of epilog
    const start = exactTime.getDate().getTime()
    const duration = timeStampToMs(schedule.duration)

    // Accumulated time for slide timeouts
    let timeoutSum = 0

    function getRandomIntInclusive(min, max) {
  	min = Math.ceil(min);
  	max = Math.floor(max);
  	return Math.floor(Math.random() * (max - min +1)) + min;
    }

    // Setup and configure music
    const trackID = getRandomIntInclusive(0,schedule.music.tracks.length - 1)
    console.log(trackID)
    const music = document.getElementById('intro_audio')
    music.src = 'music/' + schedule.music.tracks[trackID].file
    const track = schedule.music.tracks[trackID]
    music.currentTime = timeStampToMs(track.in) / 1000

    // Setup music fadeout
    setTimeout(() => audio.fadeOut(music),
      timeStampToMs(track.out) - timeStampToMs(schedule.music.fadeDuration) - timeStampToMs(track.in))

    // Start music
    music.play()

    // Add music to data for display on "currently_playing" slide
    data.session.music = schedule.music.tracks[trackID]

    // Load all slides
    let firstSlide = true
    for (const index in schedule.slides) {
      const slide = schedule.slides[index]
      if (firstSlide) {
        // First slide without timeout (loaded at startup) and with scene information
        scene.loadSlide({
          layout: slide.layout || data.session.epilogueLayout,
          scene: 'Epilogue',
          sceneEndTime: new Date(exactTime.getDate().getTime() + duration),
          slide: slide.slide,
          slideTitle: slide.title,
          slideEndTime: new Date(start + timeoutSum + timeStampToMs(slide.duration))
        }, data)
        timeoutSum += timeStampToMs(slide.duration)
        firstSlide = false
      } else {
        // Remaining slides with corresponding timeouts
        setTimeout(() => scene.loadSlide({
          layout: slide.layout || data.session.epilogueLayout,
          slide: slide.slide,
          slideTitle: slide.title,
          slideEndTime: new Date(start + timeoutSum + timeStampToMs(slide.duration))
        }, data, () => { conference_calendar() }), timeoutSum)
        timeoutSum += timeStampToMs(slide.duration)
      }
    }

    callback()
  }

  function timeStampToMs (timestamp) {
    return moment(timestamp, 'HH:mm:ss').diff(moment().startOf('day'), 'milliseconds')
  }
}
