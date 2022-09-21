const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const options = {
    transports: ["websocket", "polling"],
    pingTimeout: 30000,
    pingInterval: 35000,
    cookie: false}
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, options);

app.use(express.static(__dirname + '/'));

app.get('/', function(req,res){
    res.sendFile(__dirname + '/game.html');
});
//--------------------------------------------
var PORT = process.env.PORT || 5056;
let rooms = [];

io.on('connection', (socket) => {
    socket.on('roominfo', function(room, name_of_player_connecting){
    socket.join(room);
    const clients = socket.adapter.rooms.get(room);
    let players_num = clients.size

    if (clients.size === 1){
        rooms.push({gameName: room, connectionID: socket.id, player: players_num, playername: name_of_player_connecting})
    }
    let roomsattached = rooms.filter(p => p.gameName === room)
    if (roomsattached.length > 0 && clients.size >1){
        let check_for_player1 = roomsattached.some(p => p.player === 1)
        let check_for_player2 = roomsattached.some(p => p.player === 2)
        let check_for_player3 = roomsattached.some(p => p.player === 3)
        let check_for_player4 = roomsattached.some(p => p.player === 4)
        if (!check_for_player1){
            players_num = 1;
            rooms.push({gameName: room, connectionID: socket.id, player: players_num, playername: name_of_player_connecting})
        }
        else if (!check_for_player2){
            players_num = 2;
            rooms.push({gameName: room, connectionID: socket.id, player: players_num, playername: name_of_player_connecting})
        }
        else if (!check_for_player3){
            players_num = 3;
            rooms.push({gameName: room, connectionID: socket.id, player: players_num, playername: name_of_player_connecting})
        }
        else if (!check_for_player4){
            players_num = 4;
            rooms.push({gameName: room, connectionID: socket.id, player: players_num, playername: name_of_player_connecting})
        }

    }
    
    
    const numClients = clients ? clients.size : 0;
    if (numClients > 4){
        io.to(socket.id).emit('PlayerWarning')
    }
    let  roomsConnected = rooms.filter(p => p.gameName === room)
    //console.log('ROOMS', rooms);
    io.to(socket.id).emit('PlayerInfo', roomsConnected);
    
    socket.on('clearTrick', function (dealing){
       // console.log('clear trick pressed');
        io.in(room).emit('clearTrick', dealing);
    })

    socket.on('callareaSelection', function(){
        io.in(room).emit('callareaSelection');
    })

    socket.on('doneBid', function(info, placeholder){
        io.in(room).emit('doneBid',info, placeholder);
    })
     
    socket.on('changebid', function(){
        socket.to(room).emit('changebid');
    })

    socket.on('usScore', function(){
        io.in(room).emit('usScore');
    })

    socket.on('playerText', function(){
        io.in(room).emit('playerText');
    })

    socket.on('bidnumberText', function(){
        io.in(room).emit('bidnumberText');
    })

    socket.on('trumpText', function(){
        io.in(room).emit('trumpText');
    })

    socket.on('specialBid', function(){
        //console.log('special bid was pressed.');
        io.in(room).emit('specialBid');
    })


    socket.on('themScore', function(){
        io.in(room).emit('themScore');
    })

    socket.on('usTotalScore', function(){
        io.in(room).emit('usTotalScore');
    })

    socket.on('themTotalScore', function(){
        io.in(room).emit('themTotalScore');
    })

    socket.on('dealCards', function (hands, dealing,bidding){
        //console.log('dealCards', hands)
        io.to(room).emit('dealCards', hands, dealing,bidding);
    });

    socket.on('syncBoardclient', function(person,h1,h2,h3,h4,trick,text1,zone,zone1,text2,text3,text4,text5,text6,text4,text8,n1,n2,n3,n4,
        text9,text10,text11,text12,text13,text14,text15,text16,text17,text18,text19,text20,text21,text22,text23,n5,n6,c1,t1,t2,t3,t4,ct1,ct2,ct3,ct4)
        {

         io.to(room).emit('syncBoard', person,h1,h2,h3,h4,trick,text1,zone,zone1,text2,text3,text4,text5,text6,text4,text8,n1,n2,n3,n4,
         text9,text10,text11,text12,text13,text14,text15,text16,text17,text18,text19,text20,text21,text22,text23,n5,n6,c1,t1,t2,t3,t4,ct1,ct2,ct3,ct4)
    })

    socket.on('bidderpasses', function(whoisdealing){
        console.log('whoisdealing', whoisdealing);
        socket.to(room).emit('bidderpasses',whoisdealing);
    });

    socket.on('cardPlayed', (gameObject, playerA, playerB, playerC, playerD, Zone, h1,h2,h3,h4) => {


        socket.to(room).emit('cardPlayed',gameObject,playerA,playerB,playerC,playerD,Zone,h1,h2,h3,h4)
    });

    socket.on('connectedPlayers', function (p1,p2,p3,p4,n1,n2,n3,n4){
        io.to(room).emit('connectedPlayers', p1,p2,p3,p4,n1,n2,n3,n4);
    });

    socket.on('disconnect', function(reason){
        console.log('A user disconnected: ' + socket.id, reason);

        let removeIndex = rooms.map(function(item){return item.connectionID;}).indexOf(socket.id);

        let rm = rooms[removeIndex].gameName
        let person = rooms[removeIndex].player
        rooms.splice(removeIndex,1);
        let roomGroup = rooms.filter(p => p.gameName === rm)

        io.to(rm).emit('PlayerInfo', roomGroup);
        io.to(rm).emit('disconnection_info', person, reason);
        console.log('remaining players info', rooms);
    });
    });
});


httpServer.listen(PORT, async () => {
    try {
        console.log('Listening on port :%s...', httpServer.address().port); 
    }
    catch (e){
        console.error(e)
    }
})


