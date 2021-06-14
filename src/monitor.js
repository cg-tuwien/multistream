// TODO: LEGACY - REMOVE!
ws.onmessage = function (e) {
  document.cookie = 'serverOffline=0'
  if (connectCookiesInterval) {
    global.clearInterval(connectCookiesInterval)
  }

  const data = JSON.parse(e.data)

  if (data.date) {
    exactTime.setServerTime(data.date)
  }

  register.appendChild(registerButton)

  if (data.id) {
    stream = data.id

    let register = document.getElementById('register')

    if (global.obsstudio || conf.developmentMode) {
      if (data.isHost) {
        if (registerButton.parentNode) {
          registerButton.parentNode.removeChild(registerButton)
        }
      }
    }
  }

  if (data.streams) {
    if (register) {
      register.elements.stream.innerHTML = ''

      if (!data.streams.includes(stream)) {
        selectStream(data.streams[0])
      }

    }
  }

  update(data)
}

function selectStream (id) {
  stream = id
  websocket.send({client: true, stream: stream})
  document.cookie = "stream=" + stream
  document.cookie = "status={}"

  if (data && data.isHost === 'offline') {
    connectCookies()
  }
}

window.onload = () => {
  let cookies = cookie.parse(document.cookie)
  if (cookies.serverOffline === '1') {
    console.log('server might be down - use cookies')
    connectCookies()
  }

  if (cookies.stream) {
    stream = cookies.stream
    websocket.send({client:true, stream})
  } else {
    websocket.send({client:true})
  }

  let register = document.getElementById('register')
  if (register) {
    register.elements.stream.onchange = () => {
      selectStream(register.elements.stream.value)
    }

    register.onsubmit = () => {
      websocket.send({host: true, stream: register.elements.stream.value})

      if (registerButton && registerButton.parentNode) {
        registerButton.parentNode.removeChild(registerButton)
      }

      return false
    }
  }
}
