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

The default theme that comes with Multistream is located in `/themes/default/`. 
It contains simple slideshows for the Prologue, Break and Epilogue scenes in the respective `prologue.json`, `break.json`and `epilogue.json` files.

The slides for the slideshows are located in the `/slides` directory. 

You can define sponsors in the `data.json` file with four different sponsor levels: platinum, gold, silver and bronze. 
An example sponsor on platinum level is present in the default theme.
Sponsor logos are located in the `/sponsors` directory. For each sponsor you add in the `data.json` you have to add a logo image here.

The `theme.css`file contains CSS variables for customizing the theme (colors, logos, etc.) as well as the CSS for the slideshow slides.

Images used in the slides should be in the `/img` directory.

## Customization

Multistream themes are built for easy customization. You can customize each of the above mentioned aspects of the default theme to create your own theme.

To create a new theme, duplicate the default theme and rename the theme's root directory to you new theme name. 
You will then use this name to specify the theme in a session `data.json` as seen at the beginning of this page.

You can adjust the slideshows of your custom theme using the parameters covered in [Slideshows](#Slideshows). 
A new slide should consist of an HTML file located in `/slides`, which contains an HTML fragment to be inserted into the content element of the respective slideshow scene.
Styles for the slides should be located in the `theme.css`.

For adjusting the base CSS of the theme the following CSS variables in `theme.css` can be adjusted:

```css
:root {
    --main-color: #c6339e;
    --accent-color-1: #ecf0f3;
    --accent-color-2: #e8e8e8;
    --accent-color-2-alpha: #e8e8e800;
    --text-color-1: #54758c;
    --text-color-2: #000000;
    --main-logo: url("../themes/default/logo.png");
    --logo-side: url("../themes/default/img/logo-side.png");
}
```
`main-color` is the primary theme color used for headings and accentuation, it works well when this is a color present in the logo.

The `accent-color` fields denote background colors for containers, such as the bottom title container.

`text-color-1` is the text color for headings such as the session name and for slide titles, while the secondary text color is used for text content.

`main-logo` is a high resolution image of the oragnisation or event logo, which is present in nearly every scene.

`logo-side` is a vertical version of the logo which is displayed in the `narrow-border` [Layout](doc/Layout.md). It should have an aspect ratio of about 1:10.