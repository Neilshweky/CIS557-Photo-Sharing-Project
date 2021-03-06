const API_URL = process.env.NODE_ENV === 'production' ? 'https://cis557-404-api.herokuapp.com' : 'http://localhost:8080';

const WEBSOCKET_URI = process.env.NODE_ENV === 'production' ? 'wss://cis557-404-wss.herokuapp.com' : 'ws://localhost:8085';

function openWebSocketConnection(socket) {
  console.log("opening;'");
  // initialises event listeners
  socket.addEventListener('open', (event) => {
    socket.send(JSON.stringify({ type: 'connection', owner: 'me', text: 'Hello Server!' }));
  });

  // Listen for messages
  // socket.addEventListener('message', (event) => {
  //   console.log('Message from server ', event.data);
  // });
};

export { openWebSocketConnection, API_URL, WEBSOCKET_URI };
