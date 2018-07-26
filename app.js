const http = require('http')
const debug = require('debug')('contentstack-watch:server')
const express = require('express')
const app = express()


const port = normalizePort(process.env.PORT || '3000')
app.set('port', port)
var server = http.createServer(app)
const io = require('socket.io')(server)

server.listen(port)
server.on('error', onError)
server.on('listening', onListening)

function normalizePort (val) {
    var port = parseInt(val, 10)
    if (isNaN(port)) {
      return val
    }
    if (port >= 0) {
      return port
    }
    return false
}
function onError (error) {
    if (error.syscall !== 'listen') {
        throw error
    }
    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port
    switch (error.code) {
        case 'EACCES':
        console.error(bind + ' requires elevated privileges')
        process.exit(1)
        break
        case 'EADDRINUSE':
        console.error(bind + ' is already in use')
        process.exit(1)
        break
        default:
        throw error
    }
}
function onListening () {
    var addr = server.address()
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port
    debug('Listening on ' + bind)
}


app.use(express.static('webroot'))

app.post('/webhook/', function(req, res){
  sendMessage(req.body)
  res.header("Content-Type", "text/plain");
  res.header("statusCode", "200");
  res.set("Connection", "close");
  res.status(200)
  res.send('sucess')
})

var clients = []

io.on('connection', function(socket){
  socket.emit('update', 'set up: ' + socket.id)

  console.log('open: ' + socket.id)
  
  socket.on('setup',function(pageref){
    clients.push({'pageref': pageref, 'id': socket.id, 'socket':socket})
  })

  socket.on('disconnect',function(){
    clients.forEach(soc => { 
      if(soc.id === socket.id){
        var index = clients.indexOf(soc)
        clients.splice(index, 1)
        console.log('close: ' + socket.id)
      }
    })
  })

});

function sendMessage(msg){
  clients.forEach(soc => {
    soc.socket.emit('update', msg)
  });
}

