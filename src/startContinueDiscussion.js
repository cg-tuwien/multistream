const VideoPlaylist = require('video-playlist')
const scene = require('./scene.js')
const exactTime = require('./exact-time')
const templates = require('./templates')

const conf = require('../conf.json')

const sceneDuration = 10 // seconds

module.exports = function startContinueDiscussion (data, callback) {
  let urlString = window.location.href;
  let url = new URL(urlString);
  let index = parseInt(url.searchParams.get('index') || (data.status ? data.status.programIndex || 0 : 0));

  if (!data || !data.session || !data.session.program[index]) {
    return callback()
  }

  templates.render(document.getElementById('content'), 'continue_discussion', data,
    () => {
      scene.set({
        scene: 'Continue Discussion',
        slide: null,
        videoEndTime: new Date(new Date().getTime() + 1000),
        videoPlaylist: [
          {
            actions: [
              {
                time: 0,
                id: 'applause'
              }
            ]
          }
        ],
        sceneEndTime: new Date(exactTime.getDate().getTime() + sceneDuration * 1000)
      }, data)
      callback()
    }
  )
}
