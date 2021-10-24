require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 3002;

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

mongoose.connect(process.env.DB_CONNECT_URL);

const Player = mongoose.model('Player', {
  name: String,
  x: Number,
  y: Number,
  scene: String
});

app.get('/', (req, res) => {
  io.emit('move', {
    id: '6173549ae59006316444cffb',
    target: 'left'
  })

  res.json({msg: 'hello'});
});

app.get('/player/:playerId', async (req, res) => {
  const player = await Player.findById(req.params.playerId);
  console.log('viiim adqui')
  io.emit('move', {
    id: '6173549ae59006316444cffb',
    target: 'left'
  })

  res.json(player);
});

app.get('/player/connect/:playerId', async (req, res) => {
  const player = await Player.findById(req.params.playerId);
  io.emit('connected', player)

  res.json(player);
});

app.get('/players/:playerId/:scene', async (req, res) => {
  const players = await Player.find({ scene: req.params.scene });

  const response = players.length >= 1
    ? players.filter(({ _id }) => String(_id) !== req.params.playerId)
    : []

  res.json(response);
});

app.put('/players', async (req, res) => {
  const { playerId, x, y } = req.body;

  io.emit('move', {
    id: playerId,
    x,
    y
  })

  const a = await Player.findByIdAndUpdate(playerId, { x, y });


  res.json({playerId});
});

app.put('/players/scene', async (req, res) => {
  const { playerId, scene } = req.body;

  const a = await Player.findByIdAndUpdate(playerId, { scene });

  io.emit('connected', a)

  res.json({playerId});
});

app.post('/players', async (req, res) => {

  const newPLayer = await Player.create({
    x: req.body.x,
    y: req.body.y,
    scene: req.body.scene
  });
  console.log('a user connected', newPLayer);

  res.json(newPLayer);
});

io.on('connection', async (socket) => {
  const info = {
    id: socket.id,
    connected: socket.connected,
  };

  console.log('a user connected', info);

  socket.on('disconnect', async () => {
    console.log('user disconnected', info);
  });
});

httpServer.listen(port, () => {
  console.log(`listening on *:${port}`);
});
