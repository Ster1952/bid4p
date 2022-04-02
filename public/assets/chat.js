const socket = io({transports: ['websocket'], upgrade: false })
const muteButton = document.querySelector("#muteButton")
const stopVideo = document.querySelector("#stopVideo")
let pc = []
let socketId
let myStream
let myVideoStream
getAndSetUserStream() 

socket.on('connect', () => {
    socketId = socket.id
    socket.emit('participate', {
        room: ROOM_ID,
        socketId: socketId
    })

    socket.on('new_user', (data) => {
        console.log('additional new_user', data)
        socket.emit('newUserStart', { to: data.socketId, sender: socketId })
        pc.push(data.socketId)
        init(true, data.socketId) // webrtc to new user

    })

    socket.on('newUserStart', data => {
        console.log('no new user start', data.sender)
        pc.push(data.sender)
        init(false, data.sender)  // don't webrtc to new user

    })

    socket.on('ice candidates', async (data) => {
        data.candidate ? await pc[data.sender].addIceCandidate(new RTCIceCandidate(data.candidate)) : '';
    });

    socket.on('sdp', async (data) => {
        console.log('sdp action');
        if (data.description.type === 'offer') {
            data.description ? await pc[data.sender].setRemoteDescription(new RTCSessionDescription(data.description)) : '';

            getUserFullMedia().then(async (stream) => {
                if (!document.getElementById('local').srcObject) {
                    document.getElementById('local').srcObject = stream;
                }

                //save my stream
                myStream = stream;

                stream.getTracks().forEach((track) => {
                    pc[data.sender].addTrack(track, stream);
                });

                let answer = await pc[data.sender].createAnswer();

                await pc[data.sender].setLocalDescription(answer);

                socket.emit('sdp', { description: pc[data.sender].localDescription, to: data.sender, sender: socketId });
            }).catch((e) => {
                console.error(e);
            });
        }

        else if (data.description.type === 'answer') {
            await pc[data.sender].setRemoteDescription(new RTCSessionDescription(data.description));
        }
    });

    // socket.on('muteVideo', function (muteVideo) {
    //     // console.log('recd muteVideo',muteVideo);
    //     let id = String(muteVideo) + "-video";
    //     let mySt = document.getElementById(id).srcObject;
    //     mySt.getVideoTracks()[0].enabled = !(mySt.getVideoTracks()[0].enabled);
    // });

    // socket.on('mute-A', function (mAudio) {
    //     // console.log('Mute Audio',mAudio);
    //     let id = String(mAudio) + "-video";
    //     let mySt = document.getElementById(id).srcObject;
    //     mySt.getAudioTracks()[0].enabled = !(mySt.getAudioTracks()[0].enabled);
    // });

    muteButton.addEventListener("click", () => {
        const enabled = myStream.getAudioTracks()[0].enabled;
        if (enabled) {
          myStream.getAudioTracks()[0].enabled = false;
          let html = `<i class="fas fa-microphone-slash"></i>`;
          muteButton.classList.toggle("background__red");
          muteButton.innerHTML = html;
        } else {
          myStream.getAudioTracks()[0].enabled = true;
          let html = `<i class="fas fa-microphone"></i>`;
          muteButton.classList.toggle("background__red");
          muteButton.innerHTML = html;
        }
      });
      
    stopVideo.addEventListener("click", () => {
    const enabled = myStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myStream.getVideoTracks()[0].enabled = false;
        let html = `<i class="fas fa-video-slash"></i>`;
        stopVideo.classList.toggle("background__red");
        stopVideo.innerHTML = html;
    } else {
        myStream.getVideoTracks()[0].enabled = true;
        let html = `<i class="fas fa-video"></i>`;
        stopVideo.classList.toggle("background__red");
        stopVideo.innerHTML = html;
    }
    });




})  // end of connect

// FUNCTIONS SECTION

function init(createOffer, partnerName) {
    pc[partnerName] = new RTCPeerConnection(getIceServer());
    //------
    console.log('init function ', createOffer, myStream)
    if (myStream) {
        myStream.getTracks().forEach((track) => {
            pc[partnerName].addTrack(track, myStream);
        });
    }
    else {
        //-----

        getUserFullMedia().then((stream) => {
            //save my stream
            myVideoStream = stream
            addVideoStream(myVideo,stream)
            myStream = stream;

            stream.getTracks().forEach((track) => {
                pc[partnerName].addTrack(track, stream);//should trigger negotiationneeded event
            });

            document.getElementById('local').srcObject = stream;
        }).catch((e) => {
            console.error(`stream error: ${e}`);
        });
    }


    //create offer
    if (createOffer) {
        console.log('created offer');
        pc[partnerName].onnegotiationneeded = async () => {
            let offer = await pc[partnerName].createOffer();

            await pc[partnerName].setLocalDescription(offer);

            socket.emit('sdp', { description: pc[partnerName].localDescription, to: partnerName, sender: socketId });
        };
    }



    //send ice candidate to partnerNames
    pc[partnerName].onicecandidate = ({ candidate }) => {
        socket.emit('ice candidates', { candidate: candidate, to: partnerName, sender: socketId });
    };



    //add
    pc[partnerName].ontrack = (e) => {
        let str = e.streams[0];
        if (document.getElementById(`${partnerName}-video`)) {
            document.getElementById(`${partnerName}-video`).srcObject = str;
        }

        else {
            //video elem
            let newVid = document.createElement('video');
            newVid.id = `${partnerName}-video`;
            newVid.srcObject = str;
            newVid.autoplay = 'true';
            newVid.className = 'remote-video';
            //newVid.muted = true;
            newVid.disablePictureInPicture = true;
            videos.append(newVid);

        }
    };



    pc[partnerName].onconnectionstatechange = (d) => {
        //console.log('connection state', pc[partnerName].iceConnectionState);
        switch (pc[partnerName].iceConnectionState) {
            case 'disconnected':
            case 'failed':
                closeVideo(partnerName);
                break;

            case 'closed':
                closeVideo(partnerName);
                break;
        }
    };

    pc[partnerName].onsignalingstatechange = (d) => {
        // console.log('signal state', pc[partnerName].signalingState);
        switch (pc[partnerName].signalingState) {
            case 'closed':
                //console.log("Signalling state is 'closed'");
                closeVideo(partnerName);
                break;
        }
    };
}

function getIceServer() {
    return {
        iceServers: [{
            urls: ["stun:us-turn12.xirsys.com"]
        }, {
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
        }]
    };
};

function closeVideo(elemId) {
    if (document.getElementById(`${elemId}-video`)) {
        document.getElementById(`${elemId}-video`).remove();
    }
};

function userMediaAvailable() {
    return !!(navigator.mediaDevices.getUserMedia || navigator.mediaDevices.webkitGetUserMedia || navigator.mediaDevices.mozGetUserMedia || navigator.mediaDevices.msGetUserMedia);
};


function getUserFullMedia() {
    //console.log('user media available', userMediaAvailable());
    if (userMediaAvailable()) {
        return navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
    }

    else {
        throw new Error('User media not available');
    }
};

// function stopVideo() {
//     let mySt = document.getElementById('local').srcObject;
//     console.log('myStopped Video', mySt);
//     if (mySt === null) {
//         return false;
//     } else {
//         mySt.getVideoTracks().forEach(track => track.enabled = !track.enabled);
//         if (mySt.getVideoTracks()[0].enabled === true) {
//             document.getElementById('sv').style.background = '#e7e7e7';
//         }
//         if (mySt.getVideoTracks()[0].enabled === false) {
//             document.getElementById('sv').style.background = '#FF0000';
//         }
//         socket.emit('muteVideo', room, socketId);
//     }
// };

// function stopAudio() {
//     let mySt = document.getElementById('local').srcObject;
//     if (mySt === null) {
//         return false;
//     } else {
//         mySt.getAudioTracks()[0].enabled = !(mySt.getAudioTracks()[0].enabled);

//         if (mySt.getAudioTracks()[0].enabled === true) {
//             //console.log('mute audio true');
//             document.getElementById('sa').style.background = '#e7e7e7';
//         }
//         if (mySt.getAudioTracks()[0].enabled === false) {
//             //console.log('mute audio false');
//             document.getElementById('sa').style.background = '#FF0000';
//         }
//         socket.emit('mute-A', room, socketId);
//     }
//};

function getAndSetUserStream() {
    getUserFullMedia().then((stream) => {
        myStream = stream;
        document.getElementById('local').srcObject = stream;
    }).catch((e) => {
        console.error('stream error: ${e}');
    });
}


