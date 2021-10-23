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
    origin: "https://goofy-hamilton-34c1a3.netlify.app",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 3002;

app.use(cors())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

mongoose.connect('mongodb+srv://dom:dom@dom.iuvn4.mongodb.net/test');

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
  const { playerId, x, y, scene } = req.body;

  io.emit('move', {
    id: playerId,
    x,
    y,
    scene
  })

  const a = await Player.findByIdAndUpdate(playerId, { x, y, scene });

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

  socket.on('vamo', async (msg) => {
    // console.log(msg);


    // await Player.findByIdAndUpdate({ _id: msg.id }, { scene: 'ijiasjsdoidsaj' })

    // const doc = await Player.findOne();

    // console.log(doc)


  });
  // function randomIntFromInterval(min, max) {
  //   return Math.floor(Math.random() * (max - min + 1) + min)
  // }

  // const newPLayer = await Player.create({
  //   x: randomIntFromInterval(1, 9),
  //   y: randomIntFromInterval(1, 9)
  // });
  // console.log('a user connected', newPLayer);

  // socket.on('disconnect', async () => {
  //   const deletedPlayer = await Player.deleteOne({ _id: newPLayer._id });
    
  //   console.log('user disconnected', deletedPlayer);
  // });
});

httpServer.listen(port, () => {
  console.log(`listening on *:${port}`);
});
