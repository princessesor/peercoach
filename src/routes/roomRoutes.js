import express from 'express';
import { v4 as uuidV4 } from 'uuid';

const router = express.Router();

// In-memory store for room IDs
const rooms = new Set();

// TODO: POST (done)
// Route to generate a unique room URL under /room path
router.post('/create', (req, res) => {
    const roomId = uuidV4(); // Generate a new room ID
    rooms.add(roomId); // Store it in memory for validation
    console.log('Generated Room ID:', roomId); // Log the room ID for debugging
    res.json({ roomId }); // Send back the room ID as JSON
});

// Route to validate a room ID (optional but recommended for join checks)
router.post('/validate', (req, res) => {
    const { roomId } = req.body;
    const exists = rooms.has(roomId);
    res.json({ exists }); // Send whether the room exists
});

// Route to render the room page with the room ID under /room path
router.get('/:roomId', (req, res) => {
    // TODO: It is temporarily solution. You need to generate a unique room ID base on ids of 2 users that can join this room. (done.... i think)
    // Problem was that the uuidV4() was generating a new ID every user create room, which mean both users created new room for yourself.

    const { roomId } = req.params;

    if (rooms.has(roomId)) {
        console.log(`In the GET /:room route, room ID: ${roomId}`);
        res.render('room', { roomId }); // Render room page with roomId
    } else {
        res.status(404).send('Room not found. Invalid or expired Room ID.');
    }
});

export default router;

