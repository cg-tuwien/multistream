window.addEventListener('load', start)

function start () {
  let data

  divs = document.getElementsByClassName('conference_calendar') // Calendar!
  if (divs.length) {
    let div = document.createElement('div')
    div.className = 'calendar'
    divs[0].appendChild(div)

    let url = divs[0].getAttribute('data-url')

    fetch(url)
      .then(data => data.json())
      .then(_data => {
        data = _data
        conference_calendar_render(div, data, {})
      })
  }
}

if (typeof module !== 'undefined') {
  module.exports = start
}

function conference_calendar_render (div, data, options={}) {
  let days = []
  let columns = {}
  let row_has_sessions = []
  let step = 5 // minutes
  let stepTimeAxes = 20 // minutes
  let min = 24 * (60 / step)
  let max = 0

  data.forEach(entry => {
    let start = entry.start_date.match(/^([0-9\-]{10})T([0-9]{2}):([0-9]{2})/)
    if (!start) {
      return
    }

    entry.start_row_1 = (start[2] * (60 / step)) + Math.floor(start[3] / step)
    if (min > entry.start_row_1) {
      min = entry.start_row_1
    }

    if (days.indexOf(start[1]) === -1) {
      days.push(start[1])
    }

    if (!(entry.column in columns) && entry.column) {
      columns[entry.column] = true
    }

    entry.end_row_1 = entry.start_row_1 + Math.round(entry.duration / step)
    if (max < entry.end_row_1) {
      max = entry.end_row_1
    }

    for (let i = entry.start_row_1; i < entry.end_row_1; i++) {
      row_has_sessions[i] = 1
    }
  })

  days.sort()
  columns = Object.keys(columns)
  min = Math.floor(min / (60 / step)) * (60 / step)

  div.setAttribute('style', "grid-template-rows: [days] auto repeat(" + (max - min + 2) + ", 0.4em); grid-template-columns: [times] auto [times-end] 0.5em " + days.map(day => columns.map(column => "[day-" + day + "-" + conference_calendar_escape_column(column) + "] 1fr").join(" ")+ "[day-" + day + "-end] 0.5em ").join("\n") + ";")

  node = document.createElement('div')
  node.className = 'daySpacer'
  node.setAttribute('style', "grid-column: times-end")
  div.appendChild(node)

  days.forEach((day, index) => {
    let node = document.createElement('div')
    node.className = 'day'
    node.setAttribute('style', "grid-column: day-" + day + "-" + conference_calendar_escape_column(columns[0]) + " / day-" + day + "-end")
    node.innerHTML = day
    div.appendChild(node)

    node = document.createElement('div')
    node.className = 'daySpacer'
    node.setAttribute('style', "grid-column: day-" + day + "-end")
    div.appendChild(node)
  })

  let time = new Date()
  time.setMinutes(min % (60 / step) * step)
  time.setHours(min / (60 / step))
  for (let i = parseInt(min); i <= max; i += (stepTimeAxes / step)) {
    let node = document.createElement('div')
    node.setAttribute('style', "grid-row: " + (i - min + 2) + ' / ' + (i - min + 2 + (stepTimeAxes / step)))
    node.className = 'times'
    node.innerHTML = time.getHours() + ':' + conference_calendar_lpad(time.getMinutes())
    div.appendChild(node)
    time = new Date(time.getTime() + stepTimeAxes * 60000)

    node = document.createElement('div')
    node.className = 'timeSpacer'
    node.setAttribute('style', "grid-row: " + (i - min + 2))
    div.appendChild(node)
  }

  data.forEach(entry => {
    const node = document.createElement('a')
    if (entry.class) {
      node.setAttribute('class', entry.class)
    }
    node.setAttribute('href', entry.url)
    node.setAttribute('title', entry.title)
    let day = entry.start_date.substr(0, 10)

    node.setAttribute('style', (entry.color ? "background: " + (entry.color) + "; " : "") + "grid-row: " + (entry.start_row_1 - min + 2) + " / " + (entry.end_row_1 - min + 2) + "; grid-column: day-" + day + "-" + (entry.column ? conference_calendar_escape_column(entry.column) : conference_calendar_escape_column(columns[0]) + " / day-" + day + "-end") + ";")
    div.appendChild(node)
    let start = new Date(entry.start_date)
    let end = new Date(start.getTime() + entry.duration * 60000)

    node.innerHTML = '<div class="short_title">' + entry.short_title + '</div>' +
	             '<div class="title">' + entry.title + '</div>'
  })
}


function conference_calendar_lpad (str) {
  if (str.toString().length === 1) {
    return '0' + str
  }

  return str
}

function conference_calendar_escape_column (str) {
  return str.replace(/ /g, '_')
}
