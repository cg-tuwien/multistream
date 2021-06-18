const templates = require('./templates')
const defaultTemplates = require('./layoutTemplates.json')

class Layout {
  init (data, callback) {
    this.data = data
    this.prefix = document.body.getAttribute('data-scene') || 'default'

    callback()
  }

  changeLayout (layout) {
    if (!layout) {
      return
    }

    const classes = Array.from(document.body.classList)
    classes.forEach(l => {
      if (l.match(/^layout-/)) {
        document.body.classList.remove(l)
      }
    })

    document.body.classList.add('layout-' + layout)
  }

  render () {
    let entry = {}
    let session = {}
    if (this.data.session) {
      session = this.data.session

      if (this.data.session.program && this.data.status && 'programIndex' in this.data.status && this.data.status.programIndex >= 0 && this.data.status.programIndex < this.data.session.program.length) {
        entry = this.data.session.program[this.data.status.programIndex]
      }
    }

    const layout = entry[this.prefix + 'Layout'] || session[this.prefix + 'Layout']
    this.changeLayout(layout)

    templates.render(document.getElementById('bottom_container'), entry[this.prefix + 'BottomTemplate'] || session[this.prefix + 'BottomTemplate'] || defaultTemplates[this.prefix + 'BottomTemplate'] || defaultTemplates.defaultBottomTemplate, this.data)
    templates.render(document.getElementById('sidebar_container'), entry[this.prefix + 'SidebarTemplate'] || session[this.prefix + 'SidebarTemplate'] || defaultTemplates[this.prefix + 'SidebarTemplate'] || defaultTemplates.defaultSidebarTemplate, this.data)
    templates.render(document.getElementById('title_container'), entry[this.prefix + 'TitleTemplate'] || session[this.prefix + 'TitleTemplate'] || defaultTemplates[this.prefix + 'TitleTemplate'] || defaultTemplates.defaultTitleTemplate, this.data)
  }
}

const layout = new Layout()
module.exports = layout
