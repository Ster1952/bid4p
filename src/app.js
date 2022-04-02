const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io')
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

let PORT = process.env.PORT || 5056
let stream = require( './ws/stream' );
let path = require( 'path' );
let favicon = require( 'serve-favicon' );

app.use( favicon( path.join( __dirname, 'favicon.ico' ) ) );
app.use( '/assets', express.static( path.join( __dirname, 'assets' ) ) );

app.get( '/', ( req, res ) => {
    res.sendFile( __dirname + '/index.html' );
} );


io.of( '/stream' ).on( 'connection', stream );




httpServer.listen(PORT, async () => {
    try {
        console.log('Listening on port :%s...', httpServer.address().port);
    }
    catch (e) {
        console.error(e)
    }
})
