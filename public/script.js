const socket = io('/')
const videoGrid = document.getElementById('video-grid') 
const myPeer = new Peer(undefined, {
   host: 'https://7524-85-108-196-234.ngrok-free.app',
   // host: '192.168.1.105',
   //host: '/',
    port: '443',
    secure: true,
    path: '/'
})
const myVideo = document.createElement('video')
myVideo.muted = true

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
  addVideoStream(myVideo, stream)

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

  socket.on('user-connected', userId => {
   connectToNewUser(userId, stream)
  })
})

myPeer.on('open', id=> {
    socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream){
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {  //handle when someone leaves the video
        video.remove()
    })
}

function addVideoStream(video, stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () =>{
        video.play()
    })
    videoGrid.append(video)
}