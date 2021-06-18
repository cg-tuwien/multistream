const scene = require('./scene.js')
const exactTime = require('./exactTime')
const templates = require('./templates')

const sceneDuration = 10 // seconds

module.exports = function startContinueDiscussion (data, callback) {
  const urlString = window.location.href
  const url = new URL(urlString)
  const index = parseInt(url.searchParams.get('index') || (data.status ? data.status.programIndex || 0 : 0))

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
