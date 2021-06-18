const fs = require('fs')
const Twig = require('twig')

const conf = require('./conf.json')

const data = fs.readFileSync('obs-scene-collection.json-template').toString()

const template = Twig.twig({ data })

const content = template.render({ conf })

fs.writeFileSync('obs-scene-collection.json', content)
