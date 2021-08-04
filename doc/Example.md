# Setting up a Live Stream

This is a complete guide on setting up a live stream from scratch, populating it with data and streaming via OBS.

## Multistream Setup

### Installation
If you have not already installed it, clone and install Multistream as follows:

Install Node.JS

```shell
git clone https://gitlab.cg.tuwien.ac.at/eg2021/multistream
cd multistream
cp conf.json-dist conf.json # contains the global configuration
npm install
npm start # this will start the NodeJS server, listing for Websocket connections
```

If you are testing Multistream locally, you do not need to make changes to the`conf.json` file, otherwise replace 'localhost' with your respective URL. 

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

### Data Sources
Multistream expects its input data to be in a `/data` directory at the following position:
```
multistream
|_ bin
|_ css
|_ data
   |_ session
|_ music
...
```
Here `session` corresponds to a session in the conference. 
A single session usually contains one or more talks with a video, a fast-forward and a teaser image as well as a session sponsor.
For each session there is a `data.json` file which describes the session program and contains additional metadata such as authors, talk durations and so on.

An example session can be found [here](link.to.file). 

We will use this dummy session data for our example setup.
Unpack the session data and move it into the `/data` directory (create it if necessary). 
Additionally, if you want to have music playing during the prologue and epilogue slideshows, Multistream expects the music tracks to be located in a `/music` directory.
Read the documentation on [Slideshows](/doc/Theme.md#Slideshows) to see how to set up a music track.

### Testing your Setup
To test if the setup is working, visit http://localhost:8000/test.html (or your server URL if you are not running it locally), where you can find a web interface that lets you see the different scenes, as they will be displayed in the final stream.
Set the leftmost dropdown to 'Example' to view the example session.
In the 'Scene' dropdown you can now check each scene, while 'Program Point' allows for switching between the talks in the session.
Note that there is a separate program point for the session start called 'Welcome and Introduction', which does not have a video as it is only meant to be a live video.

## OBS Setup

### Scene Collection
The OBS scene collection is automatically compiled from the scene html files in `/scenes` when you run `npm install`. 
In case you have modified the scenes (see [here](README.md#Scenes) on how to do that), you will have to recompile the scene collection by running

```shell
npm run build
```

to re-build the whole project or 

```shell
npm run build-obs-scene-collection
```
to only re-compile the OBS scene collection.

The scene collection file can then be found in the project root directory under the name `obs-scene-collection.json`

### Stream Deck
While not necessary for operating Multistream, we found that using a [Stream Deck](https://www.elgato.com/stream-deck) is useful for improving the live streaming workflow.
Since the Stream Deck profiles can only be properly created by the official proprietary software, we cannot provide a profile with Multistream. 
It is, however, very easy to set it up manually. 
We used a profile, where each OBS scene has a dedicated button on the Stream Deck as well as some extra Buttons for playing an applause and enabling/disabling color filters on the 'Live Zoom' scene. 

### Import and set up Scene Collection
* In OBS import the scene collection `obs-scene-collection.json` (Scene Collection -> Import -> ... -> choose the file -> Import)
* Select "Multistream Scenes" from the Scene Collection menu
    * Set the image source in the OBS Scene "Error Slide" to use "error_slide.png"
    * Set the source of "Applause File" in the "Live Zoom" scene to the "applause_talk.mp3" file
    * In the Stream Deck applause key set Soundboard File to "applause_talk.mp3"
* Setup the audio capture in OBS to use the system sound output
* Setup the screen capture in OBS capture the secondary display (1920x1080)
* Setup OBS shortcuts (File -> Settings -> Hotkeys) as following:
    * Transition: Strg + Alt + Shift + T
    * Live Zoom No Filter -> Show: Strg + Alt + Shift + F
    * Live Zoom No Filter -> Hide: Strg + Alt + Shift + D
    * Applause File -> Strg + Alt + Shift + A
* Setup OBS to output a full HD stream (File -> Settings -> Video -> Output Resolution -> 1920x1080)

### Set up Custom Browser Dock
* Create a custom browser dock (View -> Docks -> Custom Browser Docks...)
    * Dock Title: "Monitor" 
    * Url: http://localhost:8000/obs-dock.html (or your remote server url as specified in `conf.json`)
    
### Screen Recording
In order to insert live video sources into the stream, we capture a Zoom meeting via screen capture of a second display. 
This captured video is then overlaid in the OBS scenes 'Live Zoom' and 'Introduction'.

## Streaming the Session
To stream the actual session the following steps need to be taken:
* In the monitor dock select the upcoming session ('Example') from the “Stream” drop down
* In the monitor dock click “Register as Stream Host” (This claims the 'Example' stream on the stream server and allows OBS to control this session stream)
* Make sure that “Current Program point” is set to the first entry in the drop down (In our case 'Welcome and Introduction')
* Select the “Prologue” scene in OBS
* In OBS settings enter this sessions Stream Key
* Click "Start Streaming" in OBS to start the live stream.

## Controls during the Stream
While streaming a session you can control Multistream via two inputs. 
The first is switching between scenes, which you can do directly from OBS (or via a Stream Deck).
To provide the correct data for each program point, you use the OBS Dock.
Here you select the "Current Program Point". 
E.g. when you want to show the second talk, you choose the according program point and then transition to the "Video" scene.
 
