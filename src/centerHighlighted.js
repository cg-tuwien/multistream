module.exports = function centerHighlighted (dom) {
  const highlighted = dom.querySelector('.highlighted')

  if (!highlighted) {
    return
  }

  const center = highlighted.offsetTop + highlighted.offsetHeight / 2
  dom.scrollTop = center - dom.offsetHeight / 2
  console.log(highlighted.offsetTop, highlighted.offsetHeight, dom.innerHeight, dom.offsetHeight)
}
