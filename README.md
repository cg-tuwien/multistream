# Multistream

Multistream is a node.js based live streaming tool, which was developed for the [Eurographics'2021](https://conferences.eg.org./eg2021) conference. 
It is designed to work with [OBS Studio](https://obsproject.com/) for streaming multiple parallel streams managed by a central server.
The web server provides pages filled with stream content, such as title cards, videos, etc., which are then displayed in OBS via browser sources.
All content management is done by the server, which allows for the streamers to fully focus on the stream itself.
    
## Installation
Install Node.JS

```shell
git clone https://gitlab.cg.tuwien.ac.at/eg2021/multistream
cd multistream
cp conf.json-dist conf.json # contains the global configuration
npm install
npm start # this will start the NodeJS server, listing for Websocket connections
```

Apache configuration:
```shell
sudo a2enmod proxy proxy_wstunnel
```

```
ProxyPassMatch   "^/stream/socket$" "ws://127.0.0.1:8080/"
```

If you don't have Apache, you can start a webserver on http://localhost:8000/ with the following command:
```
npm run http-server
```

### Development
```
npm run watch # to build OBS scenes and monitor
```

Automatically re-compile dist/app.js when sources change.

Open http://localhost:8000/test.html to play with the scenes.

In `conf.json` you can enable the `developmentMode`. Then you can get some functionlity which is reserved for OBS inside a normal browser window too.

## Usage
When there are multiple sessions defined, you can select the correct session by:

* Appending ?stream=ID to the URL (e.g. on the Prologue; subsequent requests will access the same stream as it will be saved in a cookie)
* Visiting the monitor (index.html): select the stream and click "Register as stream host"
* By default the first non-claimed stream will be assigned to the stream host

Stream Hosts are identified by their IP address.

## OBS Studio configuration
### HTML files
These HTML-Files are used to create the scenes of OBS Studio.

In OBS Studio they are included as local files (they might be converted into PHP Scripts which use a database to load current data).

Inclusion in OBS Studio:
* Add a Source "Browser"
* Local file (add file)
* Resolution: 1920x1080, [x] Control audio via OBS
* Custom CSS: `body { background-color: white; margin: 0px auto; overflow: hidden; }`
* [x] Shutdown source when not visible, [x] Refresh browser when scene becomes active

## Youtube
* Create new live stream -> Later date -> Streaming software
* Schedule stream:
  * Title e.g. "EG2021 Stream Test #3"
  * Availabilty: Unlisted
  * Science & Technology
  * Audiance: No, it's not made for kids; don't restrict over 18
  * Stream settings:
    * copy stream key into OBS Studio Stream settings
    * Stream latency: ultra low-latency
    * Enable Auto-start & Auto-stop
    * Enable DVR: t.b.d. (it allows pause & seek on streams)

## Documentation
### Scenes
The following scenes are defined:

| HTML File | JS File | Scene Name | Parameters | Description |
|------|------------|------------|-------------|-------------|
| template.html | src/startTemplate.js | Template | scene=*name*: Override scene name | Scene with the default background but no content as such. Can be used, when background should be overlayed by OBS sources. |
| prologue.html | src/startPrologue.js | "Prologue" OR "Prologue Now" | start=*ISO 8601 time*: timestamp when session starts; start=now: start prologue now | Scene which precedes the session with countdown. Scene "Prologue Now" is configured in OBS to start the Prologue now. |
| epilogue.html | src/startEpilogue.js | Epilogue | | Scene which ends a session |
| fast_forward.html | src/startFastForward.js | Fast Forward | | Scene which cycles through all fast forward videos of the session |
| video.html | src/startVideo.js | Video *n+1* | index=*n* | Show the video of the *n*th program point. The index-parameter counts from 0, the scene name from 1 (?index=0 -> Video 1) |
| introduction.html | src/startIntroduction.js | Introduction *n+1* | index=*n* | Introduction for the presenter of the *n*th program point. The index-parameter counts from 0, the scene name from 1 (?index=0 -> Introduction 1) |
| test.html | src/startTest.js | - | - | GUI for testing all scenes |

### Status-Parameter
Each scene will send status updates to the server (and save them to a cookie, in case the server is down). The following properties are used:

* scene: name of the current scene (must equal the scene name in OSB)
* sceneEndTime: timestamp of the end of the scene (if known)
* sceneNext: hint, which scene comes next
* slide: id of the slide within the current scene (if `null`, the other slide-properties will be deleted)
* slideIndex: index of the current slide
* slideTitle: title of the current slide
* slideEndTime: timestamp of the end of the slide (if known)
* programIndex: index of the current program point

## Themes

The appearance of the stream HTML files can be customized using themes which can be defined in the `/themes` directroy. 
A default theme is provieded in the `/default` subdirectory. A documentation on how to create and customize themes can be sound [here](/doc/Theme.md) 
