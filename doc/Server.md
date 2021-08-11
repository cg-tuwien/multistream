# Server

The Multistream server is responsible for managing session data, delivering data to the streaming clients and logging.

To start the server use the following command:

```shell
npm start
```

## Communication with Clients

The server establishes communication with clients as follows:

### Host is not registered yet
* Host connect
* Server message list of defined streams, e.g. {"streams":["foo","bar"],"date":"2020-01-01T01:01:01.123Z"}
* Host message {host:true} // optionally: stream:"bar"
* Server assigns random stream - will keep until end
* Server message {id:'foo',session:...,status:...,...}
* The last message will be repeated, when the status changes

### Host registers on /
* Host connect
* Server message list of defined streams, e.g. {streams:[foo, bar]}
* Host message {stream:bar}
* Server assigns selected stream to IP
* Server message {id:'bar',session:...,...}
* The last message will be repeated, when the status changes

### Host sends status update
* Host message {status:{scene:...,title:...,...}}
* Server message {id:'bar',session:...,...} to all clients of this stream

### Client
* Client connect
* Server message list of defined streams, e.g. {streams:[foo, bar]}
* Client message {client:true,id:'foo'}
* Server message {id:'foo',session:...,...}
* The last message will be repeated, when the status changes

## Logging

The server creates a `log.csv` file for each session in the session's root directory. 
Here each scene transition is logged with a timestamp. 
Additionally, events such as the start time of the actual live stream within OBS are also logged.
These logs can later be used to automatically cut the video or add custom timestamps for each scene.