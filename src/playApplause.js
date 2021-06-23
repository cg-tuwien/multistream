module.exports = function playApplause (def) {
  const applause = document.createElement('audio')
  applause.src = '../data/' + def.applause
  applause.play()
}
