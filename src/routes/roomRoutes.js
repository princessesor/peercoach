import express from 'express';
import { v4 as uuidV4 } from 'uuid';

const router = express.Router();

//TODO: POST
// Route to generate a unique room URL under /room path
router.get('/create', (req, res) => {
    const roomId = uuidV4(); // Generate a unique room ID
    console.log('Generated Room ID:', roomId); // Log the room ID for debugging
    res.redirect(`/room/${roomId}`); // Redirect to the unique room URL under /room path
});

// Route to render the room page with the room ID under /room path
router.get('/:room', (req, res) => {
    console.log(`In the GET /:room route, room ID: ${req.params.room}`);
    res.render('room', { roomId: req.params.room }); // Render room page with roomId
});

export default router;
