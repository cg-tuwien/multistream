```json
{
  "session": {
    "title": "Session Title",
    "start": "2021-01-20T15:30:00",
    "program": [
    ]
  }
}
```

### Scene Video
either
```json
{
  "session": {
    "program": [
      {
        "videoFile": "filename.mp4",
        "videoDuration": 1234.5,
        "applause": true/false,
      },
      {
        "videoPlaylist": [
          {
            "video": "filename1.mp4",
            "videoDuration": 1234.5,
	    "pause": [
	      "time": 0,
	      "duration": 10,
	      "template": "introduction"
	    ]
          },
          {
            "video": "filename2.mp4",
            "videoDuration": 1234.5,
          }
      }
    ]
  }
}
```

Either a file or a playlist (see https://github.com/plepe/video-playlist/ for details)

Parameter:
* videoFile: a file in the same directory as data.json
* videoPlaylist: instead of videoFile a playlist
* videoLayout: which layout to use: 'fullscreen' (default), 'bottom-title', 'preview'
* videoTitleTemplate: which template to render for the title container (default: 'bottom-title')
* videoPreviewTemplate: which template to render for the preview container (default: 'preview'), alternatives could be 'playlist'
* videoSessionTitleTemplate: which template to render for the session_title container (default: 'session_title')
* videoContinueNext: if true, automatically continue with the video of the next program point

it will update the `status.slideIndex` value to the index in the playlist

`template` parameters in playlist pauses will be rendered via Twig.
