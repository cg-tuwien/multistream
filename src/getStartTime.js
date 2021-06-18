module.exports = function getStartTime () {
  // Read session start form URL
  const urlString = window.location.href
  const url = new URL(urlString)
  return url.searchParams.get('start')
}
