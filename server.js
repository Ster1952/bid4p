const express = require('express');
const { createServer } = require("http");
const { Server } = require('socket.io');
const options = {
    transports: ["websocket", "polling"],
    pingTimeout: 30000,
    pingInterval: 35000,
    cookie: false}
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, options);

let PORT = process.env.PORT || 5056
let stream = require( './src/ws/stream' );
let path = require( 'path' );
let favicon = require( 'serve-favicon' );

app.use( favicon( path.join( __dirname, 'favicon.ico' ) ) );
app.use( '/', express.static( path.join( __dirname, 'src' ) ) );

app.get( '/', ( req, res ) => {
    res.sendFile( __dirname + '/src/index.html' );
} );


io.of( 'src/ws/stream' ).on( 'connection', stream );




httpServer.listen(PORT, async () => {
    try {
        console.log('Listening on port :%s...', httpServer.address().port);
    }
    catch (e) {
        console.error(e)
    }
})
