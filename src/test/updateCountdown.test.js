const updateCountdown = require('../updateCountdown')

test('check countdown for start in past', () => {
  document.body.innerHTML =
    '<div id="countdown" value="2021-05-03T15:00:00+02:00">' +
    '</div>'

  updateCountdown()
  expect(document.getElementById('countdown').innerHTML).toEqual('now')
})

test('check countdown for start in future', () => {
  const startDate = new Date()
  startDate.setHours(startDate.getHours() + 2)

  document.body.innerHTML =
    '<div id="countdown" value=' + startDate.toISOString() + '>' +
    '</div>'

  const diff = (startDate.getTime() - new Date().getTime()) / 1000

  const minutes = Math.floor(diff / 60)
  const seconds = Math.floor(diff % 60)

  updateCountdown()
  expect(document.getElementById('countdown').innerHTML).toEqual('in ' + minutes + ':' + seconds)
})
