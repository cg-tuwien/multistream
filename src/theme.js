class Theme {
  init (data, callback) {
    const urlString = window.location.href
    const url = new URL(urlString)
    this.id = url.searchParams.get('theme') || (data.session ? data.session.theme : null) || 'eg2021'
    this.data = data

    global.fetch('themes/' + this.id + '/data.json')
      .then(req => req.json())
      .then(json => {
        this.data.theme = json
        callback(null)
      })
      .catch(error => {
        console.error('Could not load theme data.json', error)
        this.data.theme = {}
        callback()
      })

    const style = document.createElement('link')
    style.href = 'themes/' + this.id + '/style.css'
    style.rel = 'stylesheet'
    document.head.appendChild(style)
  }

  render () {
    let div

    if (this.data.theme.logo) {
      div = document.querySelector('#logo_container')
      if (div) {
        div.style.backgroundImage = 'url("themes/' + this.id + '/' + this.data.theme.logo + '")'
      }

      div = document.querySelector('#logo_container_small')
      if (div) {
        div.style.backgroundImage = 'url("themes/' + this.id + '/' + this.data.theme.logo + '")'
      }
    }
  }
}

const theme = new Theme()
module.exports = theme
