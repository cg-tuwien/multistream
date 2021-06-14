const VideoPlaylist = require('video-playlist')
const scene = require('./scene.js')
const exactTime = require('./exact-time')
const templates = require('./templates')

const conf = require('../conf.json')

const sceneDuration = 10 // seconds

module.exports = function startSponsoredBy (data, callback) {
  if (!data || !data.session || !data.session.sponsored_by) {
    return callback()
  }

  templates.render(document.getElementById('content'), 'sponsored_by', data,
    () => {
      scene.set({
        scene: 'Sponsored By',
        slide: null,
        sceneEndTime: new Date(exactTime.getDate().getTime() + sceneDuration * 1000),
      }, data)

      callback()
    }
  )
}
