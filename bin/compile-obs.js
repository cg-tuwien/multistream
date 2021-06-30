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
scenes.forEach((scene) => {
  console.log('Building OBS scene for: ', scene)
  const obsScene = sources.sources.scene
  obsScene.prev_ver = obsVersion

  const sceneName = scene.split('.')[0]
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, function (str) { return str.toUpperCase() })
  obsScene.name = sceneName
  obsScene.settings.id_counter = id

  obsSceneOrder.push({ name: sceneName })

  // Add browser as scene item
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

  obsSources.push(JSON.parse(JSON.stringify(obsScene)))

  // Add corresponding browser source
  const browserSource = sources.sources.browser_source

  browserSource.name = itemName
  browserSource.prev_ver = obsVersion
  browserSource.settings.height = conf.obs.resolution.height
  browserSource.settings.width = conf.obs.resolution.width
  browserSource.settings.url = conf.url + 'scenes/' + scene

  id++

  obsSources.push(JSON.parse(JSON.stringify(browserSource)))
})

// Compile scene collection from template

template.name = conf.obs.sceneCollectionName
template.current_program_scene = obsSources[0].name
template.current_scene = obsSources[0].name
template.sources = obsSources
template.scene_order = obsSceneOrder

console.log(template)

fs.writeFileSync('test.json', JSON.stringify(template))
