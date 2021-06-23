const fs = require('fs')

const randomId = require('../src/randomId.js')

fs.writeFileSync('dist/cache_id.json', JSON.stringify(randomId()))
