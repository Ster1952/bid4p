const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

app.set('view engine', 'ejs')
app.use(express.static('public'))  // this static folder holds all code

app.get('/', (req,res) => {
    res.redirect(`/${uuidV4()}`) // create a new room and redirect user to it
})
app.get('/:room', (req,res) => {
    res.render('room', {roomId: req.params.room})  // creates route for rooms and pass it into the url
})

io.on('connect', socket => {
    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId)
        socket.to(roomId).emit('user-connected', userId)
        console.log(roomId,userId)
        socket.on('disconnect', () => {
            
            socket.to(roomId).emit('user-disconnected', userId)
        })
    })
})

server.listen(process.env.PORT || 5056)