# Multistream

Multistream is a node.js based live streaming tool, which was developed for the [Eurographics'2021](https://conferences.eg.org/eg2021) conference. 
It is designed to work with [OBS Studio](https://obsproject.com/) for streaming multiple parallel streams managed by a central server.
The web server provides pages filled with stream content, such as title cards, videos, etc., which are then displayed in OBS via browser sources.
All content management is done by the server, which allows for the streamers to fully focus on the stream itself.

![Multistream Overview](./doc/multistream_overview.png "Schematic overview of Multistream")
    
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

In `conf.json` you can enable the `developmentMode`. Then you can get some functionality which is reserved for OBS inside a normal browser window too.

## Usage
A detailed guide on how to set up and use Multistream can be found [here](/doc/Example.md).

## Documentation
### Scenes
Scenes are the main components of which a stream is comprised. 
Each scene is a HTML page which also has a corresponding OBS scene.
More on scenes can be found [here](/doc/Scenes.md).

### Themes

The appearance of the stream HTML files can be customized using themes which can be defined in the `/themes` directory. 
A default theme is provided in the `/default` subdirectory. A documentation on how to create and customize themes can be found [here](/doc/Theme.md)

### Layouts

A layout defines the layout of the screen in regards to the position and size of content, title and additional screen elements. More on layouts can be found [here](/doc/Layout.md) 


    
