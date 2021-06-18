const scene = require('./scene.js')
const templates = require('./templates')
const playApplause = require('./playApplause.js')

module.exports = function startIntroduction (data, callback) {
  const urlString = window.location.href
  const url = new URL(urlString)
  const index = parseInt(url.searchParams.get('index') || (data.status ? data.status.programIndex || 0 : 0))

  if (!data || !data.session || !data.session.program || !data.session.program[index]) {
    return
  }

  const entry = data.session.program[index]

  const template = entry.introductionContentTemplate || data.session.introductionContentTemplate || 'introduction'

  templates.render(document.getElementById('content'), template, data)

  let videoEndTime = null
  let videoPlaylist = null

  if (entry.introductionApplause) {
    playApplause({ applause: entry.introductionApplause })

    videoEndTime = new Date(new Date().getTime() + 1000)
    videoPlaylist = [{ actions: [{ time: 0, applause: entry.introductionApplause }] }]
  }

  scene.set({
    scene: 'Introduction',
    sceneEndTime: null,
    sceneNext: 'video or zoom live',
    programIndex: index,
    slide: null,
    videoEndTime,
    videoPlaylist
  }, data)

  callback()
}
