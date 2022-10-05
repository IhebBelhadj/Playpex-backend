#!/usr/bin/env node
'use strict';

var STATIC_OPTIONS = { maxAge: 3600000 };

var 

  http = require('http'),
  path = require('path'),
  cors = require('cors'),
  serveStatic = require('serve-static'),
  store = require('./lib/store'),
  socket = require('./lib/socket'),
  api = require('./lib/api')
    .use(serveStatic(path.join(__dirname, 'torrents'), STATIC_OPTIONS))
    .use(cors());

var server = http.createServer(api);
socket(server);
var port = process.env.PORT || 9000;

server.listen(port).on('error', function (e) {
  if (e.code !== 'EADDRINUSE' && e.code !== 'EACCES') {
    throw e;
  }
  console.error('Port ' + port + ' is busy. Trying the next available port...');
  server.listen(++port);
}).on('listening', function () {
  console.log('Listening on http://localhost:' + port);
});

//Stop all torrents at start
var torrents = store.list().map((torrent)=>{
  return torrent.infoHash
});

torrents.forEach(hash => {
  var torrent = store.get(hash);
  torrent.files.forEach(function (f) {
    f.deselect();
  });
});

