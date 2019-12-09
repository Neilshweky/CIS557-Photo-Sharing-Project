const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const wss = new WebSocket.Server({ port: 8085, clientTracking: true });
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
    client = decoded.name;
    if (client !== 'webserver') {
      // Add client to map of clients
      connectedUsers.set(String(client), ws);
    }
  });

  ws.on('message', (message) => {
    console.log(`Received ${message} from ${client}`);
    if (client === 'webserver') {
      // Parse notification
      const notification = JSON.parse(message);
      switch (notification.type) {
        case "open": {
          ws.send("Connected to notification server.");
        }
        default: {

        }
      }
      // get list of recipients
      //const recipients = new Array(JSON.parse(message));
      //recipients.forEach((element) => {
        //if (connectedUsers.get(String(element)) !== undefined) {
          //connectedUsers.get(String(element)).send('update');
        //}
      //});
    }
  });
});
