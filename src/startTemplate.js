const templates = require('./templates')
const scene = require('./scene.js')

module.exports = function startTemplate (data, callback) {
  let urlString = window.location.href;
  let url = new URL(urlString);
  let sceneId = url.searchParams.get('scene') || 'Template'

  let entry = {}
  let session = {}
  if (data.session) {
    session = data.session

    if (data.session.program && data.status && 'programIndex' in data.status) {
      entry = data.session.program[data.status.programIndex]
    }
  }

  let template = entry['templateContentTemplate'] || session['templateContentTemplate']

  if (template) {
    templates.render(document.getElementById('content'), template, data,
      () => {
        scene.set({
          scene: sceneId,
          slide: null
        }, data)

        callback()
      }
    )
  } else {
    scene.set({
      scene: sceneId,
      slide: null
    }, data)

    callback()
  }
}
