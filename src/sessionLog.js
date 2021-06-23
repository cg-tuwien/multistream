const async = require('async')
const moment = require('moment')
const fs = require('fs')

const logfiles = {}

module.exports = {
  update (sessions, callback) {
    async.eachOf(
      sessions,
      (session, id, done) => {
        if (!(id in logfiles)) {
          // ignore close errors
          console.log('open log', id)
          fs.open('data/' + id + '/log.csv', 'a', (err, fd) => {
            if (err) {
              console.error('Can\'t open log for session ' + id + ': ' + err)
            }

            logfiles[id] = fd
            done()
          })
        } else {
          done()
        }
      },
      () => {
        for (const id in logfiles) {
          if (!(id in sessions) && logfiles[id]) {
            console.log('closing log', id)
            fs.close(logfiles[id], (err) => {
              if (err) {
                console.error('Can\'t close log for session ' + id + ': ' + err)
              }
            })

            delete logfiles[id]
          }
        }

        callback()
      }
    )
  },

  write (id, str) {
    fs.write(logfiles[id], moment().utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z,' + str + '\n', () => {})
  },

  close (id) {
    logfiles[id].close(() => {})
  }
}
