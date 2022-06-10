/**
 * @author Amir Sanni <amirsanni@gmail.com>
 * @date 6th January, 2020
 */
import h from './helpers.js';

window.addEventListener( 'load', () => {
    const room = prompt("Enter room ID")
   

        let pc = [];

        let socket = io( '/stream', {"forceWebsockets": true });

        let socketId = '';
        let myStream = '';
        let screen = '';

        //Get user video by default
        getAndSetUserStream();


        socket.on( 'connect', () => {
            //set socketId
            socketId = socket.io.engine.id;
            //document.getElementById('randomNumber').innerText = randomNumber;


            socket.emit( 'subscribe', {
                room: room,
                socketId: socketId
            } );


            socket.on( 'new user', ( data ) => {
                socket.emit( 'newUserStart', { to: data.socketId, sender: socketId } );
                pc.push( data.socketId );
                init( true, data.socketId );
            } );


            socket.on( 'newUserStart', ( data ) => {
                pc.push( data.sender );
                init( false, data.sender );
            } );


            socket.on('user-disconnected', userId => {
                console.log('user disconnected', userId, pc)
                if ( document.getElementById( `${userId}-video` ) ) {
                  
                    document.getElementById( `${userId}-video` ).remove();
                }
            })

            socket.on( 'ice candidates', async ( data ) => {
                data.candidate ? await pc[data.sender].addIceCandidate( new RTCIceCandidate( data.candidate ) ) : '';
            } );


            socket.on( 'sdp', async ( data ) => {
                if ( data.description.type === 'offer' ) {
                    data.description ? await pc[data.sender].setRemoteDescription( new RTCSessionDescription( data.description ) ) : '';

                    h.getUserFullMedia().then( async ( stream ) => {
                        if ( !document.getElementById( 'local' ).srcObject ) {
                            h.setLocalStream( stream );
                        }

                        //save my stream
                        myStream = stream;

                        stream.getTracks().forEach( ( track ) => {
                            pc[data.sender].addTrack( track, stream );
                        } );

                        let answer = await pc[data.sender].createAnswer();

                        await pc[data.sender].setLocalDescription( answer );

                        socket.emit( 'sdp', { description: pc[data.sender].localDescription, to: data.sender, sender: socketId } );
                    } ).catch( ( e ) => {
                        console.error( e );
                    } );
                }

                else if ( data.description.type === 'answer' ) {
                    await pc[data.sender].setRemoteDescription( new RTCSessionDescription( data.description ) );
                }
            } );

        } );


        function getAndSetUserStream() {
            h.getUserFullMedia().then( ( stream ) => {
                //save my stream
                myStream = stream;

                h.setLocalStream( stream );
            } ).catch( ( e ) => {
                console.error( `stream error: ${ e }` );
            } );
        }

        function init( createOffer, partnerName ) {
            pc[partnerName] = new RTCPeerConnection( h.getIceServer() );

            if ( screen && screen.getTracks().length ) {
                screen.getTracks().forEach( ( track ) => {
                    pc[partnerName].addTrack( track, screen );//should trigger negotiationneeded event
                } );
            }

            else if ( myStream ) {
                myStream.getTracks().forEach( ( track ) => {
                    pc[partnerName].addTrack( track, myStream );//should trigger negotiationneeded event
                } );
            }

            else {
                h.getUserFullMedia().then( ( stream ) => {
                    //save my stream
                    myStream = stream;

                    stream.getTracks().forEach( ( track ) => {
                        pc[partnerName].addTrack( track, stream );//should trigger negotiationneeded event
                    } );

                    h.setLocalStream( stream );
                } ).catch( ( e ) => {
                    console.error( `stream error: ${ e }` );
                } );
            }



            //create offer
            if ( createOffer ) {
                pc[partnerName].onnegotiationneeded = async () => {
                    let offer = await pc[partnerName].createOffer();

                    await pc[partnerName].setLocalDescription( offer );

                    socket.emit( 'sdp', { description: pc[partnerName].localDescription, to: partnerName, sender: socketId } );
                };
            }



            //send ice candidate to partnerNames
            pc[partnerName].onicecandidate = ( { candidate } ) => {
                socket.emit( 'ice candidates', { candidate: candidate, to: partnerName, sender: socketId } );
            };



            //add
            pc[partnerName].ontrack = ( e ) => {
                let str = e.streams[0];
                if ( document.getElementById( `${ partnerName }-video` ) ) {
                    document.getElementById( `${ partnerName }-video` ).srcObject = str;
                }

                else {
                    //video elem
                    let newVid = document.createElement( 'video' );
                    newVid.id = `${ partnerName }-video`;
                    newVid.srcObject = str;
                    newVid.autoplay = true;
                    newVid.className = 'remote-video';
                    newVid.disablePictureInPicture = true;
                    videos.append(newVid);
                
                    

                    //video controls elements
                   // let controlDiv = document.createElement( 'div' );
                    //controlDiv.className = 'remote-video-controls';
                    //controlDiv.innerHTML = `<i class="fa fa-microphone text-white pr-3 mute-remote-mic" title="Mute"></i>
                    //    <i class="fa fa-expand text-white expand-remote-video" title="Expand"></i>`;

                    //create a new div for card
                    //let cardDiv = document.createElement( 'div' );
                    //cardDiv.className = 'card card-sm';
                    //cardDiv.id = partnerName;
                    //cardDiv.appendChild( newVid );
                   // cardDiv.appendChild( controlDiv );

                    //put div in main-section elem
                   // document.getElementById( 'videos' ).appendChild( cardDiv );
                    document.getElementById( 'videos' ).appendChild( newVid );

                    //h.adjustVideoElemSize();
                }
            };



            pc[partnerName].onconnectionstatechange = ( d ) => {
                switch ( pc[partnerName].iceConnectionState ) {
                    case 'disconnected':
                    case 'failed':
                        h.closeVideo( partnerName );
                        break;

                    case 'closed':
                        h.closeVideo( partnerName );
                        break;
                }
            };



            pc[partnerName].onsignalingstatechange = ( d ) => {
                switch ( pc[partnerName].signalingState ) {
                    case 'closed':
                        console.log( "Signalling state is 'closed'" );
                        h.closeVideo( partnerName );
                        break;
                }
            };
        }







        function broadcastNewTracks( stream, type, mirrorMode = true ) {
            h.setLocalStream( stream, mirrorMode );

            let track = type == 'audio' ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0];

            for ( let p in pc ) {
                let pName = pc[p];

                if ( typeof pc[pName] == 'object' ) {
                    h.replaceTrack( track, pc[pName] );
                }
            }
        }

      


        //When the video mute icon is clicked
        document.getElementById('toggle-video').addEventListener('click', (e) => {
            e.preventDefault();
        console.log('toggle video',e.target.classList)
        let iconVideo = document.getElementById('buttonVideo')
            if (myStream.getVideoTracks()[0].enabled){
                if (e.target.classList.contains('btn-video')){
                    console.log('step1')
                   iconVideo.className = 'fa fa-video-slash fa-xl text-white'
                   myStream.getVideoTracks()[0].enabled = false;
                }
                else if (e.target.classList.contains('fa-video') || e.target.classList.contains('btn-video')){
                    e.target.classList.remove('fa-video');
                    e.target.classList.add('fa-video-slash');
                    myStream.getVideoTracks()[0].enabled = false;
                    }
                }
                else {
                    if (e.target.classList.contains('btn-video')){
                        console.log('step3')
                        iconVideo.className = 'fa fa-video fa-xl text-white'
                        myStream.getVideoTracks()[0].enabled = true;
                     }
                    else if(e.target.classList.contains('fa-video-slash') || e.target.classList.contains('btn-video')){
                        e.target.classList.remove('fa-video-slash');
                        e.target.classList.add('fa-video');
                        myStream.getVideoTracks()[0].enabled = true;
                    }
                }
                broadcastNewTracks(myStream, 'video')
        
        })


        //When the audio mute icon is clicked
        document.getElementById('toggle-mute').addEventListener('click', (e) => {
            e.preventDefault();
            console.log('toggle audio',e.target.classList)
            let iconAudio = document.getElementById('buttonAudio')
            if (myStream.getAudioTracks()[0].enabled){
                if (e.target.classList.contains('btn-audio')){
                    console.log('step1')
                   iconAudio.className = 'fa fa-microphone-slash fa-xl text-white'
                   myStream.getAudioTracks()[0].enabled = false;
                }
                else if (e.target.classList.contains('fa-microphone')){
                    console.log('step2')
                    e.target.classList.remove('fa-microphone');
                    e.target.classList.add('fa-microphone-slash');
                    myStream.getAudioTracks()[0].enabled = false;
                    }
                }
                else {
                    if (e.target.classList.contains('btn-audio')){
                        console.log('step3')
                        iconAudio.className = 'fa fa-microphone fa-xl text-white'
                        myStream.getAudioTracks()[0].enabled = true;
                     }
                     else if(e.target.classList.contains('fa-microphone-slash')){
                        console.log('step4')
                        e.target.classList.remove('fa-microphone-slash');
                        e.target.classList.add('fa-microphone');
                        myStream.getAudioTracks()[0].enabled = true;
                    }
                }
                broadcastNewTracks(myStream, 'audio')
        
        })

    //}
} );
