module.exports = function (dom) {
  if (dom.offsetHeight >= dom.scrollHeight) {
    return
  }

  const columnWidth = dom.offsetWidth
  const columnHeight = dom.offsetHeight

  const client = document.getElementById('program')
  client.style.position = 'absolute'
  client.style.height = columnHeight + 'px'
  client.style.top = 0

  const count = 10
  client.style.width = (columnWidth) + 'px'
  client.style.columnCount = count
  client.style.columnWidth = columnWidth + 'px'
  client.style.columnGap = '10px'
  client.style.columnRuleWidth = 0

  window.setInterval(() => {
    if (dom.scrollLeft + columnWidth + 14 > dom.scrollWidth) {
      dom.scrollLeft = 0
    } else {
      dom.scrollLeft += columnWidth + 14
    }
  }, 5000)
}
