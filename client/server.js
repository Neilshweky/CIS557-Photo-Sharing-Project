/* eslint-disable no-console */
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());


if (process.env.NODE_ENV === 'production') {
  console.log('We\'re in production!');
  // Serve any static files
  app.use(express.static(path.join(__dirname, '/build')));
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/build', 'index.html'));
  });
}

const port = process.env.PORT || '3000';
app.listen(port);
console.log(`Server running on port ${port}. Now open http://localhost:${port}/ in your browser!`);
