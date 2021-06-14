module.exports = function getStartTime() {
  // Read session start form URL
  let urlString = window.location.href;
  let url = new URL(urlString);
  return url.searchParams.get('start');
}
