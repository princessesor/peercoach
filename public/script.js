const socket = io('/', {
    reconnectionDelayMax: 10000,
    transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
});
const videoGrid = document.getElementById('video-grid');
const videoGridGuess = document.getElementById('video-grid-guess');
const myPeer = new Peer(undefined, {
    //host: 'https://a896-212-252-193-98.ngrok-free.app',
    //host: '192.168.1.105',
    //host: '/',
    port: '443',
    secure: true,
    path: '/',
    debug: 3, // Enable detailed debug logs
});
let myStream; // Define a variable to hold your stream globally
let connectedPeers = {}; // Track connected peers
let isConnected = false; // Track connection state
let isInRoom = false; // Track if we're in a room successfully

const myVideo = document.createElement('video');
myVideo.muted = true;

// Debug event for socket connection
socket.on('connect', () => {
    console.log('Socket connected with ID:', socket.id);
});

// Debug event for socket connection errors
socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
});

// Listen for confirmation that we've joined the room
socket.on('room-joined', ({ roomId, success }) => {
    console.log(`Room join confirmation: Room ${roomId}, Success: ${success}`);
    isInRoom = success;
});

// Listen for user-connected events
socket.on('user-connected', (userId) => {
    console.log('Received user-connected event for:', userId);

    // Only call connectToNewUser if we have our stream and we're in a room
    if (myStream && isInRoom) {
        setTimeout(() => {
            // Small delay to ensure peer connection is ready
            connectToNewUser(userId, myStream);
        }, 1000);
    } else {
        console.error('Cannot connect to user - no stream available or not in room');
        if (!myStream) console.error('- Stream not available');
        if (!isInRoom) console.error('- Not confirmed in room');
    }
});

navigator.mediaDevices
    .getUserMedia({
        video: true,
        audio: true,
    })
    .then((stream) => {
        console.log('Got local media stream');
        myStream = stream;
        addVideoStream(myVideo, stream);

        // Answer calls from other users
        myPeer.on('call', (call) => {
            console.log('Received call from peer', call);
            call.answer(stream);

            const video = document.createElement('video');
            video.muted = true;
            call.on('stream', (userVideoStream) => {
                console.log('Got stream from caller');
                addVideoStream(video, userVideoStream, true);
            });

            call.on('error', (err) => {
                console.error('Error in call:', err);
            });
        });

        isConnected = true;
    })
    .catch((error) => {
        console.error('Failed to get media stream:', error);
    });

// Handle Peer connection events
myPeer.on('open', (id) => {
    console.log('Peer connection opened with ID:', id);

    // Join the room once peer connection is established
    socket.emit('join-room', ROOM_ID, id);
    console.log('Emitted join-room for room:', ROOM_ID);
});

myPeer.on('error', (err) => {
    console.error('Peer connection error:', err);
});

function connectToNewUser(userId, stream) {
    console.log('Attempting to connect to user:', userId);

    // Check if already connected to this peer
    if (connectedPeers[userId]) {
        console.log('Already connected to:', userId);
        return;
    }

    try {
        // Make a call to the peer
        const call = myPeer.call(userId, stream);
        console.log('Calling peer:', userId);

        if (!call) {
            console.error('Failed to create call object for user:', userId);
            return;
        }

        const video = document.createElement('video');
        video.muted = true;

        // When we receive their stream
        call.on('stream', (userVideoStream) => {
            console.log('Received stream from called user:', userId);
            addVideoStream(video, userVideoStream, true);
            connectedPeers[userId] = call; // Track this connection
        });

        call.on('close', () => {
            console.log('Call closed for user:', userId);
            video.remove();
            delete connectedPeers[userId];
        });

        call.on('error', (err) => {
            console.error('Call error for user ' + userId + ':', err);
            delete connectedPeers[userId];
        });
    } catch (error) {
        console.error('Error connecting to new user:', error);
    }
}

function addVideoStream(video, stream, guess = false) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play().catch((e) => console.error('Error playing video:', e));
    });
    guess ? videoGridGuess.append(video) : videoGrid.append(video);
}
