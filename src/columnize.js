module.exports = function (dom) {
  console.log(dom.offsetHeight, dom.scrollHeight)

  if (dom.offsetHeight >= dom.scrollHeight) {
    return
  }

  const columnWidth = dom.offsetWidth
  const columnHeight = dom.offsetHeight
  console.log(columnWidth, columnHeight)

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

  console.log(dom.scrollWidth)
  window.setInterval(() => {
    if (dom.scrollLeft + columnWidth + 14 > dom.scrollWidth) {
      dom.scrollLeft = 0
    } else {
      dom.scrollLeft += columnWidth + 14
    }
  }, 5000)
}
