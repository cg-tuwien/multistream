const scene = require('./scene.js')

module.exports = function startTemplate (data, callback) {
  const urlString = window.location.href
  const url = new URL(urlString)
  const sceneId = url.searchParams.get('scene') || 'Empty'

  scene.set({
    scene: sceneId,
    slide: null
  }, data)

  callback()
}
