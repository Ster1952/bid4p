export default {
    closeVideo( elemId ) {
        if ( document.getElementById( elemId ) ) {
            document.getElementById( elemId ).remove();
        }
    },


    pageHasFocus() {
        return !( document.hidden || document.onfocusout || window.onpagehide || window.onblur );
    },


    getQString( url = '', keyToReturn = '' ) {
        url = url ? url : location.href;
        let queryStrings = decodeURIComponent( url ).split( '#', 2 )[0].split( '?', 2 )[1];

        if ( queryStrings ) {
            let splittedQStrings = queryStrings.split( '&' );

            if ( splittedQStrings.length ) {
                let queryStringObj = {};

                splittedQStrings.forEach( function ( keyValuePair ) {
                    let keyValue = keyValuePair.split( '=', 2 );

                    if ( keyValue.length ) {
                        queryStringObj[keyValue[0]] = keyValue[1];
                    }
                } );

                return keyToReturn ? ( queryStringObj[keyToReturn] ? queryStringObj[keyToReturn] : null ) : queryStringObj;
            }

            return null;
        }

        return null;
    },


    userMediaAvailable() {
        return !!( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia );
    },


    getUserFullMedia() {
        if ( this.userMediaAvailable() ) {
            return navigator.mediaDevices.getUserMedia( {
                video: {"width": 320, "height": 240, "frameRate": 15 },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true
                }
            } );
        }

        else {
            throw new Error( 'User media not available' );
        }
    },


    getUserAudio() {
        if ( this.userMediaAvailable() ) {
            return navigator.mediaDevices.getUserMedia( {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true
                }
            } );
        }

        else {
            throw new Error( 'User media not available' );
        }
    },


    getIceServer() {
        return {
            iceServers: [
                {
                    urls: ["stun:us-turn12.xirsys.com"]
                },
                {
                    username: "n8k7T74KxBy_BoK6SeLI4DBDbRI2E1NMg14iKZK4K6WPA0zD-Mcs4Yzc4B66N9JeAAAAAGCgXB1zdHJlZXRlcmI=",
                    credential: "0b400954-b5d7-11eb-99a8-0242ac120004",
                    urls: [
                        "turn:us-turn12.xirsys.com:80?transport=udp",
                        "turn:us-turn12.xirsys.com:3478?transport=udp",
                        "turn:us-turn12.xirsys.com:80?transport=tcp",
                        "turn:us-turn12.xirsys.com:3478?transport=tcp",
                        "turns:us-turn12.xirsys.com:443?transport=tcp",
                        "turns:us-turn12.xirsys.com:5349?transport=tcp"

                    ]
                }
            ]
        };
    },

    replaceTrack( stream, recipientPeer ) {
        let sender = recipientPeer.getSenders ? recipientPeer.getSenders().find( s => s.track && s.track.kind === stream.kind ) : false;

        sender ? sender.replaceTrack( stream ) : '';
    },





    toggleVideoBtnDisabled( disabled ) {
        document.getElementById( 'toggle-video' ).disabled = disabled;
    },


    maximiseStream( e ) {
        let elem = e.target.parentElement.previousElementSibling;

        elem.requestFullscreen() || elem.mozRequestFullScreen() || elem.webkitRequestFullscreen() || elem.msRequestFullscreen();
    },


    singleStreamToggleMute( e ) {
        if ( e.target.classList.contains( 'fa-microphone' ) ) {
            e.target.parentElement.previousElementSibling.muted = true;
            e.target.classList.add( 'fa-microphone-slash' );
            e.target.classList.remove( 'fa-microphone' );
        }

        else {
            e.target.parentElement.previousElementSibling.muted = false;
            e.target.classList.add( 'fa-microphone' );
            e.target.classList.remove( 'fa-microphone-slash' );
        }
    },


    toggleModal( id, show ) {
        let el = document.getElementById( id );

        if ( show ) {
            el.style.display = 'block';
            el.removeAttribute( 'aria-hidden' );
        }

        else {
            el.style.display = 'none';
            el.setAttribute( 'aria-hidden', true );
        }
    },



    setLocalStream( stream, mirrorMode = true ) {
        const localVidElem = document.getElementById( 'local' );

        localVidElem.srcObject = stream;
        mirrorMode ? localVidElem.classList.add( 'mirror-mode' ) : localVidElem.classList.remove( 'mirror-mode' );
    }


    


    //     for ( let i = 0; i < totalRemoteVideosDesktop; i++ ) {
    //         elem[i].style.width = newWidth;
    //     }
    // },


    // createDemoRemotes( str, total = 6 ) {
    //     let i = 0;

    //     let testInterval = setInterval( () => {
    //         let newVid = document.createElement( 'video' );
    //         newVid.id = `demo-${ i }-video`;
    //         newVid.srcObject = str;
    //         newVid.autoplay = true;
    //         newVid.className = 'remote-video';

    //         //video controls elements
    //         let controlDiv = document.createElement( 'div' );
    //         controlDiv.className = 'remote-video-controls';
    //         controlDiv.innerHTML = `<i class="fa fa-microphone text-white pr-3 mute-remote-mic" title="Mute"></i>
    //             <i class="fa fa-expand text-white expand-remote-video" title="Expand"></i>`;

    //         //create a new div for card
    //         let cardDiv = document.createElement( 'div' );
    //         cardDiv.className = 'card card-sm';
    //         cardDiv.id = `demo-${ i }`;
    //         cardDiv.appendChild( newVid );
    //         cardDiv.appendChild( controlDiv );

    //         //put div in main-section elem
    //         document.getElementById( 'videos' ).appendChild( cardDiv );

    //         this.adjustVideoElemSize();

    //         i++;

    //         if ( i == total ) {
    //             clearInterval( testInterval );
    //         }
    //     }, 2000 );
    // }
};
