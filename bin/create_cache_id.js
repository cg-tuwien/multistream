const fs = require('fs')

const randomId = require('../src/randomId.js')

fs.writeFileSync('cache_id.json', JSON.stringify(randomId()))
