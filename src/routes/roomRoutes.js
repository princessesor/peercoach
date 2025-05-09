import express from 'express';
import { v4 as uuidV4 } from 'uuid';

const router = express.Router();
const roomId = uuidV4(); // TODO: It is temporarily solution. You need to generate a unique room ID base on ids of 2 users that can join this room.
// Problem was that the uuidV4() was generating a new ID every user create room, which mean both users created new room for yourself.

//TODO: POST
// Route to generate a unique room URL under /room path
router.get('/create', (req, res) => {
    console.log('Generated Room ID:', roomId); // Log the room ID for debugging
    res.redirect(`/room/${roomId}`); // Redirect to the unique room URL under /room path
});

// Route to render the room page with the room ID under /room path
router.get('/:room', (req, res) => {
    console.log(`In the GET /:room route, room ID: ${req.params.room}`);
    res.render('room', { roomId: req.params.room }); // Render room page with roomId
});

export default router;
