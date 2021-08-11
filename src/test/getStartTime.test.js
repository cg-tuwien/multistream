const getStartTime = require('../getStartTime')

beforeAll( () => {
  Object.defineProperty(window, 'location', {
    value: {
      href: 'https://www.example.com?start=now'
    }
  })
})

test('retrieve start time now from URL', () => {
  expect(getStartTime()).toBe('now')
})
