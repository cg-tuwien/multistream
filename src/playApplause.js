module.exports = function playApplause (def) {
  const applause = new Audio()
  applause.src = 'data/' + def.applause
  applause.play()
}
