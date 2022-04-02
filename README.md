

 
# Demo
You can test at https://chat.1410inc.xyz.



# Alternative
If you prefer to use PHP Web socket (Ratchet) instead of socket.io and NodeJS, check out the PHP version [here](https://github.com/amirsanni/conference-call-ratchet).


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

<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.2/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous">
