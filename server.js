const http = require('http');
const server = require('websocket').server;
var express = require('express');
var app = express();
const path = require('path');
const router = express.Router();

app.use(express.static('public'))

app.get("/index", function(req, res){
	res.sendFile(path.join(__dirname+'/index.html'));
});

const httpServer = http.createServer(app);
//add the router
app.use('/', router);

httpServer.listen(process.env.PORT || 3000, () => {
  console.log('Server listening at port 1337');
});

const wsServer = new server({
  httpServer,
});

const peersByCode = {};

wsServer.on('request', request => {
  const connection = request.accept(null,request.origin);
  const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
console.log("This is the ids ="+id);
if(id){
  connection.on('message', message => {
    const { code } = JSON.parse(message.utf8Data);
    if (!peersByCode[code]) {
      peersByCode[code] = [{ connection, id }];
    } else if (!peersByCode[code].find(peer => peer.id === id)) {
      peersByCode[code].push({ connection, id });
    }

    peersByCode[code]
      .filter(peer => peer.id !== id)
      .forEach(peer => peer.connection.send(message.utf8Data));
  });
}
});