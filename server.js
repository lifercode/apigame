const express = require('express');
const app = express();
const http = require('http');
const bodyparser = require('body-parser')
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require('cors');
const io = new Server(server);


const port = process.env.PORT || 3001;

app.use(cors())
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.json({msg: 'hello'});
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});