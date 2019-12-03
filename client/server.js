const express = require('express');

const app = express();

app.use(express.static(__dirname + '/build'));
const port = process.env.PORT || '3000';
app.listen(port);
console.log(`Server running on port ${port}. Now open http://localhost:${port}/ in your browser!`);
