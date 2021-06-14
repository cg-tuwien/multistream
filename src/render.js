const Twig = require('twig')

module.exports = function render (data) {
  const toRender = document.getElementsByClassName('twig')
  Array.from(toRender).forEach(dom => {
    const template = Twig.twig({
      data: dom.innerHTML
    })

    dom.innerHTML = template.render(data)
  })
}
