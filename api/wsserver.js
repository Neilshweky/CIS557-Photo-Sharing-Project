const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const wss = new WebSocket.Server({ port: process.env.PORT || 8085, clientTracking: true });
console.log(process.env.port);
const connectedUsers = new Map();

wss.on('connection', (ws, req) => {
  let client = '';
  let token;
  // Client authentication
  if (req.headers.token !== '') {
    token = req.headers.token;
  }
  if (ws.protocol !== '') {
    token = ws.protocol;
  }

  jwt.verify(token, 'secretkey', (err, decoded) => {
    if (err) {
      console.log(`Error: ${err}`);
      return;
    }
    client = decoded.username;
    console.log(`${client} connected`);
    if (client !== 'webserver') {
      // Add client to map of clients
      connectedUsers.set(String(client), ws);
    }
  });

  ws.on('message', (message) => {
    const msg = JSON.parse(message);
    console.log(`Sending '${msg.type}' notification from ${msg.owner} to ${msg.recipients}`);
    if (client === 'webserver') {
      if (msg.type === "open") {
        ws.send("Connected to notification server.");
      } else {
        const receivers = msg.recipients;
        receivers.forEach((element) => {
          if (connectedUsers.get(String(element)) !== undefined) {
            const notification = JSON.stringify({
              type: msg.type,
              owner: msg.owner,
              data: msg.data,
            });
            connectedUsers.get(String(element)).send(notification);
          }
        });
      }
    }
  });
});
