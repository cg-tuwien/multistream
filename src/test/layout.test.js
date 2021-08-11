const layout = require('../layout')

test('change layout to narrow-border', () => {
  document.body.innerHTML =
    '<div class="layout-full">' +
    '</div>'
  layout.changeLayout('narrow-border')

  expect(document.body.classList.contains('layout-narrow-border')).toBe(true)
  expect(document.body.classList.contains('layout-full')).toBe(false)
})

test('render template with layout', () => {
  const data = {
    session: {
      defaultLayout: 'narrow-border',
      program: [
        {
          title: 'Welcome and Introduction',
          duration: 300,
          fastForwardFile: null,
          teaserImage: null,
          locationDetail: null
        }
      ]
    },
    status: {
      programIndex: 0
    }
  }

  layout.init(data, () => {})
  layout.render()

  expect(document.body.classList.contains('layout-narrow-border')).toBe(true)
})
