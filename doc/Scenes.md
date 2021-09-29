# Scenes

## Overview
The following default scenes are defined (located in `/scenes` dir):

| HTML File | JS File | Scene Name | Parameters | Description |
|------|------------|------------|-------------|-------------|
| 01prologue.html | src/startPrologue.js | Prologue | start=*ISO 8601 time*: timestamp when session starts; start=now: start prologue now | Scene, which precedes the session with countdown. Scene "Prologue Now" is configured in OBS to start the Prologue now. |
| 02sponsoredBy.html | src/startSponsoredBy.js | Sponsored By | | Scene, which displays the session sponsor and plays an applause. |
| 03fastForward.html | src/startFastForward.js | Fast Forward | | Scene, which cycles through all fast forward videos of the session |
| 04introduction.html | src/startIntroduction.js | Introduction | index=*n* | Introduction for the presenter of the *n*th program point. The index-parameter counts from 0, the scene name from 1 (?index=0 -> Introduction 1) |
| 05video.html | src/startVideo.js | Video | index=*n* | Show the video of the *n*th program point. The index-parameter counts from 0, the scene name from 1 (?index=0 -> Video 1) |
| 06ContinueDiscussion.html | src/startContinueDiscussion.js | Continue Discussion | | Scene, which plays an applause and displays where the discussion can continue. |
| 07break.html | src/startBreak.js | Break | | Scene, which shows a 20min break slideshow |
| 08epilogue.html | src/startEpilogue.js | Epilogue | | Scene, which ends a session |
| template.html | src/startTemplate.js | Template | scene=*name*: Override scene name | Scene with the default background, but no content as such. Can be used, when background should be overlayed by OBS sources. |

From these scenes the OBS scene collection is automatically compiled by the `/bin/compile-obs.js` script.  
The naming scheme of scenes is the index (to get the desired scene order in OBS) followed by the name in camelCase.

### Prologue, Break, Epilogue
Prologue, Break and Epilogue are slideshow scenes, which either start automatically when the scene becomes active, or in case of the Prologue 5 minutes before the specified `start` time in the sessions `data.json`.
For these scenes to work, a JSON file, which describes the sequence of slides, must be provided in the theme (see [Slideshows](/doc/Theme.md#slideshows))

### Sponsored By
The Sponsored By scene displays the session sponsor. A session sponsor must be present in the `data.json` for this scene to work:
```json
"sponsored_by": [
    {
        "name": "CG TU Wien",
        "logo": "sponsor0.png"
    }
]
```
Multiple sponsors can be added for a session.

### Fast Forward
This scene plays all fast forward videos present in the `data.json` one after another, each prefaced by an introduction slide.
The display duration of the introduction slide can be specified by setting a value (in seconds) for `fastForwardIntroDuration` in the `data.json` either on program point or per session.

### Introduction
The Introduction scene reserves the left part of the layout for a live video to be inserted, while in the right column info on the current program point is displayed.
The layout template for the introduction can be overwritten in the `data.json` by setting a value for `introductionContentTemplate` either on program point or per session.

### Video
In the Video scene a video or video playlist as specified in the `data.json` is played.
A video program point can be specified as a single video:
```json
{
  "session": {
    "title": "Session Title",
    "start": "2021-01-20T15:30:00",
    "program": [
      {
        "videoFile": "filename.mp4",
        "videoDuration": 1234.5,
        "applause": true
      }
    ]
  }
}
```
Here an applause will be played at the end of the video, if applause is set to `true`.

Alternatively, you can specify a video playlist (see https://github.com/plepe/video-playlist/ for details) as follows:
```json
{
  "session": {
    "title": "Session Title",
    "start": "2021-01-20T15:30:00",
    "program": [ 
      {
        "videoPlaylist": [
          {
            "video": "filename.mp4",
            "videoDuration": 1234.5,
            "actions": [
              {
                "time": 1000,
                "id": "applause"
              }
            ],
            "pauses": [
              {
                "time": "end",
                "duration": 234.5
              }
            ]
          },
          {
            "video": "filename2.mp4",
            "videoDuration": 1234.5
          }
        ]
      }
    ]
  }
}
```

Parameter:
* videoFile: a file in the same directory as data.json
* videoPlaylist: instead of videoFile a playlist
* videoLayout: which layout to use: 'fullscreen' (default), 'bottom-title', 'preview'
* videoTitleTemplate: which template to render for the title container (default: 'bottom-title')
* videoPreviewTemplate: which template to render for the preview container (default: 'preview'), alternatives could be 'playlist'
* videoSessionTitleTemplate: which template to render for the session_title container (default: 'session_title')
* videoContinueNext: if true, automatically continue with the video of the next program point. It will update the `status.slideIndex` value to the index in the playlist

`template` parameters in playlist pauses will be rendered via Twig.

### Continue Discussion
The Continue Discussion scene is intended to be displayed after each video talk. 
While it is displayed an applause sound is played back and a location and time where further discussion can take place is displayed.
The displayed time is the end time of the session.
This location can be specified for each program point in the `data.json` using the `locationDetail` parameter. 
You can also specify an icon for the location using the `locationIcon` parameter. This expects to find and icon in the path `/themes/{{ session.theme }}/icons/`  

```json
"program": [
  {
    "title": "Talk Title",
    "duration": 1000,
    "locationDetail": "Some Location",
    "locationIcon": "locationIcon.png"
  }
]
``` 

## Adding new Scenes
To add a new scene, two files need to be created: an HTML file in the `/scenes` directory following the naming scheme and a corresponding `startSceneName.js` file in the `/src` directory.  
The new scene must also be registered in the `index.json` file by adding it to the `scenes` object there. 
After creating a new scene the OBS scene collection has to be re-compiled. To do so either run:

```shell
npm run build
```

to re-build the whole project or 

```shell
npm run build-obs-scene-collection
```
to only re-compile the OBS scene collection.

Additionally, the new scene has to be added to the `src/scenes.json` file to register it with the scene testing setup.

## Testing Scenes
In `test.html` a GUI for testing all scenes is provided, this can be reached by openeing http://localhost:8000/test.html

## Status-Parameters
Each scene will send status updates to the server (and save them to a cookie, in case the server is down). The following properties are used:

* scene: name of the current scene (must equal the scene name in OBS)
* sceneEndTime: timestamp of the end of the scene (if known)
* sceneNext: hint, which scene comes next
* slide: id of the slide within the current scene (if `null`, the other slide-properties will be deleted)
* slideIndex: index of the current slide
* slideTitle: title of the current slide
* slideEndTime: timestamp of the end of the slide (if known)
* programIndex: index of the current program point