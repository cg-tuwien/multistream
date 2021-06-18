const fs = require('fs')
const async = require('async')

module.exports = function updateSessions (dataPath, sessions, callback) {
  const found = []

  fs.watch(
    dataPath,
    {
      recursive: false
    },
    (type, id) => {
      fs.stat(
        dataPath + '/' + id,
        (err, stats) => {
          if (err) {
            if (err.errno === -2) {
              delete sessions[id]
              return callback()
            } else {
              return console.error(err)
            }
          }

          if (stats.isDirectory() && !(id in sessions)) {
            sessions[id] = {}
            sessions[id].id = id
            found.push(id)
            const dataFilePath = dataPath + '/' + id + '/data.json'

            watchFile(id, dataFilePath, sessions[id], callback)
            reload(id, dataFilePath, sessions[id], callback)
          }
        }
      )
    }
  )

  fs.readdir(
    dataPath,
    {
      withFileTypes: true
    },
    (err, files) => {
      if (err) {
        console.log(err.stack)
      }
      async.each(files,
        (file, done) => {
          if (file.isDirectory()) {
            const id = file.name
            found.push(id)
            const dataFilePath = dataPath + '/' + id + '/data.json'

            if (!(id in sessions)) {
              sessions[id] = {}
              sessions[id].id = id
            }

            // if the file changes, reload and call the global callback
            watchFile(id, dataFilePath, sessions[id], callback)

            reload(id, dataFilePath, sessions[id], done)
          } else {
            done()
          }
        },
        () => {
          for (const k in sessions) {
            if (!found.includes(k)) {
              delete sessions[k]
            }
          }

          callback()
        }
      )
    }
  )
}

function watchFile (id, dataFilePath, session, callback, force = false) {
  fs.stat(dataFilePath,
    (err, stats) => {
      if (!err || err.errno !== -2) {
        if (force) {
          reload(id, dataFilePath, session, callback)
        }

        return realWatchFile(id, dataFilePath, session, callback)
      }

      // no file (yet), retry in a second
      global.setTimeout(() => watchFile(id, dataFilePath, session, callback, true), 1000)
    }
  )
}

function realWatchFile (id, dataFilePath, session, callback) {
  let timer

  fs.watch(dataFilePath,
    (t, filename) => {
      if (timer) {
        global.clearTimeout(timer)
      }

      if (t === 'change') {
        timer = global.setTimeout(
          () => reload(id, dataFilePath, session, callback)
          , 1000)
      } else {
        // got deleted, wait a second and try to reload then
        timer = global.setTimeout(
          () => fs.stat(dataFilePath,
            (err, stats) => {
              if (!err || err.errno !== -2) {
                reload(id, dataFilePath, session, callback)
              }

              watchFile(id, dataFilePath, session, callback)
            })
          , 1000)
      }
    }
  )
}

function reload (id, dataFilePath, session, callback) {
  fs.readFile(
    dataFilePath,
    (err, content) => {
      if (err) {
        console.error("ERROR: Can't load data.json of '" + id + "': " + err)
        return callback()
      }

      try {
        content = JSON.parse(content)
      } catch (e) {
        console.error("ERROR: Can't parse data.json of '" + id + "': " + e)
        return callback()
      }

      for (const k in content) {
        session[k] = content[k]
      }

      callback()
    }
  )
}
