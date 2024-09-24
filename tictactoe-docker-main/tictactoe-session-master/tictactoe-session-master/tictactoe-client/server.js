// client server entrypoint

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const SseStream = require('ssestream')

var app = express();

process.chdir(__dirname);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/', express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:false }));

app.use('/engine', require('./routes/engine'));

app.get('/join/:symbol', function(req, res) {
  res.render('index');
});

// serve stream of events in the form of game state
// pipe data stream from flask to frontend
// TODO map session_id
app.get('/events', (req, res) => {
  console.log('new connection')

  res.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*"
  });
  const EventSource = require('eventsource')
  const es = new EventSource('http://0.0.0.0:5000/events')

  const sseStream = new SseStream(req)
  sseStream.pipe(res)

  es.onmessage = function (m) {
    sseStream.write({
      data: m.data
    })
  }

  res.on('close', () => {
    console.log('lost connection')
    sseStream.unpipe(res)
  })
})

app.listen('8000', function() {
  console.log('Server listening ..');
});
