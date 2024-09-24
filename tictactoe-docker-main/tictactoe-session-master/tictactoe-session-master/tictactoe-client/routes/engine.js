const express = require('express');
const async = require('async');
const fetch = require('node-fetch');

// server side routing of requests

const router = express.Router();

router.get('/', function(req, res) {
  fetch('http://0.0.0.0:5000/session')
  .then(result => result.json())
  .then((data) => {
    res.json(data)
  })
  .catch(console.log)
});

router.get('/resetGame', function(req, res) {
  fetch('http://0.0.0.0:5000/resetGame')
  .then(result => result.json())
  .then((data) => {
    res.json(data)
  })
  .catch(console.log)
});

router.post('/sendMove', function(req, res) {
  fetch('http://0.0.0.0:5000/sendMove', {
    method: 'POST',
    headers: {
      'Accept': 'Application/json',
      'Content-Type': 'Application/json',
    },
    body: JSON.stringify({
      move: req.body.params.i,
    })
  }).then(result => result.json()).then((data) => {
    res.json(data)
  }).catch(console.log)
});

module.exports = router;
