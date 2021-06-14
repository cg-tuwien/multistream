const moment = require('moment')
const escHtml = require('escape-html')
const sprintf = require('extsprintf').sprintf

const communicator = require('./communicator')
const exactTime = require('./exact-time')
const websocket = require('./websocket')

const scenes = require('./scenes.json')

const pageWidth = 1920
const pageHeight = 1080

class Test {
  constructor (data, callback) {
    this.param = {}
    this.loaded = false

    // Update list of Scenes
    let input = document.getElementById('pageSel')
    while(input.firstChild) {
      input.removeChild(input.firstChild)
    }
    scenes.forEach(scene => {
      let option = document.createElement('option')
      option.value = scene.page
      option.appendChild(document.createTextNode(scene.title))

      input.appendChild(option)
    })

    let urlString = window.location.href
    let url = new URL(urlString)

    let form = document.getElementById('controls')
    Array.from(form.elements).forEach(input => {
      if (input.name && url.searchParams.has(input.name)) {
        this.param[input.name] = url.searchParams.get(input.name)
      }
    })

    form.onsubmit = () => {
      let iframe = document.getElementsByTagName('iframe')[0]
      iframe.contentWindow.location.reload(true)

      return false
    }

    this.updateControls()
    communicator.on('update', () => {
      this.updateControls()
    })
    communicator.once('update', () => {
      this.update()
    })
    communicator.on('set-stream', () => {
      this.updateControls()
      this.param.stream = communicator.stream
    })

    window.setInterval(() => this.updateClocks(), 100)

    this.resize()
    window.onresize = () => this.resize()

    callback()
  }

  updateControls () {
    let form = document.getElementById('controls')
    let urlString = window.location.href
    let url = new URL(urlString)

    // Update list of Streams (Sessions)
    let input = document.getElementById('stream')
    if (communicator.offlineMode) {
      if (input.nodeName === 'SELECT') {
        let _input = document.createElement('input')
        _input.name = 'stream'
        _input.id = 'stream'
        input.parentNode.insertBefore(_input, input)
        input.parentNode.removeChild(input)
      }
    } else {
      if (input.nodeName !== 'SELECT') {
        let _input = document.createElement('select')
        _input.name = 'stream'
        _input.id = 'stream'
        input.parentNode.insertBefore(_input, input)
        input.parentNode.removeChild(input)
      }

      if (communicator.streams.length) {
        while(input.firstChild) {
          input.removeChild(input.firstChild)
        }

        communicator.streams.forEach(k => {
          let option = document.createElement('option')
          option.value = k
          option.appendChild(document.createTextNode(k))

          if (k === this.param.stream) {
            option.selected = true
          }

          input.appendChild(option)
        })
      }
    }

    // Update list of Program Points
    input = document.getElementById('index')
    if (communicator.data && communicator.data.session) {
      while(input.firstChild) {
        input.removeChild(input.firstChild)
      }

      if (this.param.index === '') {
        this.param.index = '0'
      }
      this.param.index = parseInt(this.param.index)

      communicator.data.session.program && communicator.data.session.program.forEach((entry, k) => {
        let option = document.createElement('option')
        option.value = k
        option.appendChild(document.createTextNode(entry.title))

        if (k === this.param.index) {
          option.selected = true
        }

        input.appendChild(option)
      })
    }

    Array.from(form.elements).forEach(input => {
      if (input.name && url.searchParams.has(input.name)) {
        input.value = url.searchParams.get(input.name)
      }
      this.param[input.name] = input.value

      input.onchange = () => {
        this.param[input.name] = input.value
        this.update()
      }
    })

    if (!this.loaded) {
      this.update()
    }
  }

  resize () {
    var controls = document.getElementById('controls')

    var width = window.innerWidth - 4
    var height = window.innerHeight - controls.offsetHeight - 1 - 4

    if (width / (pageWidth / pageHeight) > height) {
      width = height * (pageWidth / pageHeight)
    }

    var scale = width / pageWidth

    var frame = document.getElementById('frame')
    frame.style.zoom = scale;
    frame.style.transform = 'scale(' + scale + ')';

    var wrap = document.getElementById('wrap')
    wrap.style.width = width + 'px'
    wrap.style.height = (width / (pageWidth / pageHeight)) + 'px'
  }

  update () {
    this.loaded = true

    let iframe = document.getElementsByTagName('iframe')
    if (this.param.stream !== communicator.stream) {
      communicator.setStream(this.param.stream)
    }

    let url = this.param.pageSel
    let urlParam = ''
    for (let k in this.param) {
      if (k && k !== 'pageSel') {
        url += url.match(/\?/) ? '&' : '?'
        url += encodeURIComponent(k) + '=' + encodeURIComponent(this.param[k])
      }
      if (k) {
        urlParam += urlParam.match(/\?/) ? '&' : '?'
        urlParam += encodeURIComponent(k) + '=' + encodeURIComponent(this.param[k])
      }
    }

    iframe[0].src = url

    history.pushState(null, '', 'test.html' + urlParam)
  }

  getData () {
    const data = communicator.data

    const status = document.getElementById('frame').contentWindow.sceneStatus
    if (status) {
      data.status = JSON.parse(status)
    } else {
      data.status = null
    }

    return data
  }

  updateClocks () {
    const data = this.getData()

    exactTime.getDate((err, date) => {
      if (data && data.status && data.status.sceneEndTime) {
        let rest = new Date(data.status.sceneEndTime) - new Date(date)
        if (rest < 0) {
          document.getElementById('countdown').innerHTML = '(expired)'
        } else {
          document.getElementById('countdown').innerHTML = sprintf('%s:%02d.%1d', Math.floor(rest / 60000), (rest % 60000) / 1000, (rest % 1000) / 100)
        }
      } else {
        document.getElementById('countdown').innerHTML = '(unknown)'
      }
    })
  }
}

module.exports = function startTest (data, callback) {
  new Test(data, callback)
}
