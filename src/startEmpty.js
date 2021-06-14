const scene = require('./scene.js')

module.exports = function startTemplate (data, callback) {
  let urlString = window.location.href;
  let url = new URL(urlString);
  let sceneId = url.searchParams.get('scene') || 'Empty'

  scene.set({
    scene: sceneId,
    slide: null
  }, data)

  callback()
}
