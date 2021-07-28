# Themes

The appearance of the stream HTML files can be customized via themes. 
The theme is defined on session-level, by adding the desired theme name to the sessions `data.json` as follows: 

```json
{
  "session": {
    "theme": "THEME"
  }
}
```

If no theme is provided in the session `data.json` the default theme will be used. 
A theme has to be a subdirectory of the `themes` directory and contains a theme `data.json` which contains the basic theme settings.

### Slideshows
Apart from that a theme also contains JSON files for sildeshows such as the Prologue and Epilogue scenes. 
These slideshows are loaded by the respective `startSlideshow.js`(e.g. [startPrologue.js](src/startPrologue.js)) when their respective scenes become active. 
A slideshow JSON is defined as follows:

```json
{
  "duration": "00:20:00",
  "slides": [
    {
      "slide": "welcome",
      "title": "Welcome",
      "duration": "00:00:15"
    }
  ],
  "music": {
    "tracks": [
      {
        "file": "04_kaiserwalzer.mp3",
        "title": "Kaiserwalzer",
        "description": "(waltz, op. 437)",
        "composer": "Johann Strauß II",
        "performer": "Wiener Philharmoniker",
        "conductor": "Willi Boskovsky",
        "year": "1962",
        "start": "00:20:00",
        "end": "00:10:00",
        "in": "00:00:00",
        "out": "00:10:00"
      }
    ],
    "fadeDuration": "00:00:10"
  }
}
```
`duration` is the duration of the whole slideshow in `hh:mm:ss`.

Each element of the `slides` array represents a single slide.  
The `slide` parameter corresponds to a HTML file in the `/slides` directory of the theme.  
`title` is a human-readable title for the slide.  
`duration` the time the slide is displayed in `hh:mm:ss`.

`music` contains information on the optional background music which can be played during a slideshow.  
Each track consists of a file, some metadata used for display and information on the timing of the track.  
`file` music file located in `/music` directory 
`start` refers to the start time of the track within the slideshow.  
`end` refers to the start time of the track within the slideshow.  
Note that Prologue and Break count down, while Epilogue counts up.  
`in` defines the time within the track where playback should start.  
`out` defines the time whith the track where playback should end.

`fadeDuration` is the length of the music fade out which will take place at the end of the slideshow

## Default Theme
## Customization