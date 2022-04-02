const express = require("express");
const { createServer } = require("http");
const { userInfo } = require("os");
const { Server } = require("socket.io");
const app = express();
const httpServer = createServer(app)
const io = new Server(httpServer);

app.use(express.static(__dirname + '/'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

const PORT = process.env.PORT || 5056;
//---------------

let path = require('path');
//let favicon = require('serve-favicon');

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res)=>{
    console.log('The request made is:'+ req.url);
    res.sendFile(__dirname+'/index.html');
});


io.on('connection', (socket) => {
   console.log('on connection', socket.id);


    socket.on('participate', (data)=>{
        console.log('data--->>>',data);
        socket.join(data.room);
        //socket.join(data.socketId);
        const clients = io.sockets.adapter.rooms.get(data.room);
        console.log('clients--->', clients);
        const numClients = clients ? clients.size : 0;
        console.log('data room', clients, numClients);
        if (numClients > 1) {
            socket.to(data.room).emit('new_user', {socketId:data.socketId});
        }


        //console.log('socket rooms',data.room);
    });
    

    socket.on('newUserStart', (data)=>{
        console.log('newuserstart', data.to, data.sender)
        socket.to(data.to).emit('newUserStart', {sender:data.sender});
    });


    socket.on('sdp', (data)=>{

        socket.to(data.to).emit('sdp', {description: data.description, sender:data.sender});
    });

    socket.on('muteVideo', function(rm, muted) {
        //console.log('muteVideo -->>',rm, muted);
        socket.to(rm).emit('muteVideo', muted);
    })

    socket.on('mute-A', function(rm, muted) {
        //console.log('muteAudio -->>',rm, muted);
        socket.to(rm).emit('mute-A', muted);
    })


    socket.on('ice candidates', (data)=>{
        socket.to(data.to).emit('ice candidates', {candidate:data.candidate, sender:data.sender});
    });

    socket.on('disconnect', function() {
        console.log('A user disconnected: ' + socket.id);

    });
});


//------------

httpServer.listen(PORT, async () => {
    try {
        console.log('Listening on port :%s...', httpServer.address().port)
    }
    catch (e) {
        console.error(e)
    }
});







