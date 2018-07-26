const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

app.use(express.static('webroot'))

app.post('/watch', function(req, res){
  res.status(200)
  res.send(req.body)
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

http.listen(3000, function(err){
  if(err){
    console.log(err)
  }else{
    console.log('listening on *:3000');
  }
})

function sendMessage(msg){
  console.log(clients)
  clients.forEach(soc => {
    console.log(msg)
    soc.socket.emit('update', msg)
  });
}

