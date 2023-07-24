import { WebSocketServer } from 'ws';
import { readFileSync } from 'fs';
import { createServer } from 'https';

const server = createServer({
  cert: readFileSync('cert.pem'),
  key: readFileSync('key.pem'),
  passphrase: 'fdsa'
})

server.listen(8080);

const wss = new WebSocketServer({ server });

let websockets = [];
let rooms = []; // * * array of array of objects in here (all websockets + name of room)
let UIDtoWS = new Map;
let UIDtoRoom = new Map;