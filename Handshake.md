Communication Stream Host:

## Host is not registered yet
* Host connect
* Server message list of defined streams, e.g. {"streams":["foo","bar"],"date":"2020-01-01T01:01:01.123Z"}
* Host message {host:true} // optionally: stream:"bar"
* Server assigns random stream - will keep until end
* Server message {id:'foo',session:...,status:...,...}
* The last message will be repeated, when the status changes

## Host registers on /
* Host connect
* Server message list of defined streams, e.g. {streams:[foo, bar]}
* Host message {stream:bar}
* Server assigns selected stream to IP
* Server message {id:'bar',session:...,...}
* The last message will be repeated, when the status changes

## Host sends status update
* Host message {status:{scene:...,title:...,...}}
* Server message {id:'bar',session:...,...} to all clients of this stream

## Client
* Client connect
* Server message list of defined streams, e.g. {streams:[foo, bar]}
* Client message {client:true,id:'foo'}
* Server message {id:'foo',session:...,...}
* The last message will be repeated, when the status changes
