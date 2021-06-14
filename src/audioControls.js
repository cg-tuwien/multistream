module.exports = {
  fadeOut (element) {
    if (element != null) {
      const fadeAudio = setInterval(function () {
        if (element.volume > 0.01) {
          element.volume -= 0.001
        } else {
          element.volume = 0
        }

        if (element.volume <= 0) {
          clearInterval(fadeAudio)
        }
      }, 10)
    }
  }
}
