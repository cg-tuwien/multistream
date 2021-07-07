const fs = require('fs')

const conf = require('../conf.json')
const template = JSON.parse(fs.readFileSync('bin/obs-data/obs-template.json').toString())
const sources = JSON.parse(fs.readFileSync('bin/obs-data/obs-template-sources.json').toString())

const scenes = fs.readdirSync('scenes')
const obsVersion = (conf.obs.obsVersion.major << 24) | (conf.obs.obsVersion.minor << 16) | conf.obs.obsVersion.patch

const obsSources = []
const obsSceneOrder = []

// Add scenes based on scene html files
let id = 0

function createBrowserSource (sceneName, obsScene, scene) {
  const item = sources.item

  const itemName = 'Browser ' + sceneName
  item.name = itemName
  item.id = id

  const hotkeys = {}

  hotkeys['OBSBasic.SelectScene'] = []
  hotkeys['libobs.show_scene_item.' + itemName] = []
  hotkeys['libobs.hide_scene_item.' + itemName] = []

  obsScene.hotkeys = hotkeys

  obsScene.settings.items = [item]

  // Add corresponding browser source
  const browserSource = sources.sources.browser_source

  browserSource.name = itemName
  browserSource.prev_ver = obsVersion
  browserSource.settings.height = conf.obs.resolution.height
  browserSource.settings.width = conf.obs.resolution.width
  browserSource.settings.url = conf.url + 'scenes/' + scene

  id++
  return browserSource
}

scenes.forEach((scene) => {
  console.log('Building OBS scene for: ', scene)
  const obsScene = sources.sources.scene
  obsScene.prev_ver = obsVersion

  const sceneName = scene.split('.')[0]
    .replace(/^\d+/, '')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, function (str) { return str.toUpperCase() })
  obsScene.name = sceneName
  obsScene.settings.id_counter = id

  obsSceneOrder.push({ name: sceneName })

  // Add browser as scene item
  const browserSource = createBrowserSource(sceneName, obsScene, scene)

  obsSources.push(JSON.parse(JSON.stringify(browserSource)))
  obsSources.push(JSON.parse(JSON.stringify(obsScene)))
})

// Add extra scene elements

console.log('Building additional OBS scenes...')

obsSources.push(sources.sources.monitor_capture_no_filter)
obsSources.push(sources.sources.ffmpeg_source)
obsSources.push(sources.sources.wasapi_output_capture)
obsSources.push(sources.sources.monitor_capture_filter)
obsSources.push(sources.sources.image_source)

const liveBrowser = createBrowserSource(
  'Live Background',
  JSON.parse(JSON.stringify(sources.sources.scene_live_zoom)),
  'template.html'
)

obsSources.push(JSON.parse(JSON.stringify(liveBrowser)))
obsSources.push(sources.sources.scene_live_zoom)

obsSceneOrder.push({ name: sources.sources.scene_live_zoom.name })

obsSources.push(sources.sources.scene_error)
obsSceneOrder.push({ name: sources.sources.scene_error.name })

obsSources.push(sources.sources.scene_monitor_no_filter)
obsSceneOrder.push({ name: sources.sources.scene_monitor_no_filter.name })

// Compile scene collection from template

template.name = conf.obs.sceneCollectionName
template.current_program_scene = obsSources[0].name
template.current_scene = obsSources[0].name
template.sources = obsSources
template.scene_order = obsSceneOrder

fs.writeFileSync('test.json', JSON.stringify(template))
