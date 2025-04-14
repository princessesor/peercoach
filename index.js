import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import passport from 'passport';
import flash from 'express-flash';
import session from 'express-session';
import methodOverride from 'method-override';
import initializePassport from './src/passport-config.js';
import cors from 'cors';
import User from './src/models/user.js';
import http from 'http';
import { Server } from 'socket.io';
import Message from './src/models/messages.js';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import messageRoutes from './src/routes/messageRoutes.js';
import profileRoutes from './src/routes/profileRoutes.js';
import matchesRoutes  from './src/routes/matchesRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import homeRoutes from './src/routes/homeRoutes.js';

const app = express();
dotenv.config({ path: './.env.dev' });

const PORT = process.env.PORT || 8001;

const MONGOURL = process.env.MONGO_URL;

// Middleware
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.json());

const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow credentials like cookies & session
};

app.use(cors(corsOptions));

//to allow corb
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); // Allow requests from your frontend
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Allow certain HTTP methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow these headers
    next();
});

app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, '/views'))); // to use files from views

// Set views directory
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    }),
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

// Passport Configuration
initializePassport(passport);

app.use('/messages', messageRoutes);

// MongoDB Connection
mongoose
    .connect(MONGOURL)
    .then(() => {
        console.log('Database is connected successfully.');

        // Create an HTTP server and use it to handle requests
        const server = http.createServer(app);

        // Start the server
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        // Socket.io logic
        const io = new Server(server, {
            cors: {
                origin: 'http://localhost:3000',
                methods: ['GET', 'POST'],
                credentials: true,
            },
        });

        const users = {};
        io.on('connection', (socket) => {
            //for listening to events
            console.log(`User connected: ${socket.id}`);

            socket.on('register', (userId) => {
                users[socket.id] = userId;
                io.emit('users', Object.values(users)); // to update the online user list
            });

            socket.on('sendMessage', async (data) => {
                console.log('send_message event triggered'); // Debugging log to check if event is received
                console.log(data);
                try {
                    // Convert senderId and receiverId to ObjectId
                    const senderObjectId = new mongoose.Types.ObjectId(data.sender);
                    const receiverObjectId = new mongoose.Types.ObjectId(data.receiver);

                    const newMessage = new Message({
                        senderId: senderObjectId,
                        receiverId: receiverObjectId,
                        message: data.message,
                        timestamp: new Date(),
                    });

                    await newMessage.save(); // Save the message in the database
                    console.log('Message saved:', newMessage);

                    //find recerivers socket id
                    const receiverSocket = Object.keys(users).find((key) => users[key].toString() === data.receiverId.toString());

                    if (receiverSocket) {
                        io.to(receiverSocket).emit('receiveMessage', newMessage); // Forward message to receiver
                    }
                } catch (err) {
                    console.error('Error saving message:', err);
                    socket.emit('error', { message: 'Message could not be saved' });
                }
            });

            socket.on('disconnect', () => {
                delete users[socket.id];
                io.emit('users', Object.values(users)); // Update the user list
                console.log(`User disconnected: ${socket.id}`);
            });
        });
    })
    .catch((error) => console.log(error));

//Routes
app.use('/', profileRoutes);
app.use('/', matchesRoutes);
app.use('/', chatRoutes);
app.use('/', authRoutes);
app.use('/', homeRoutes);


//everything byond is a comment
// main landing route
/* app.get('/', checkAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.render('index.ejs', { name: req.user.name, user });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Error fetching user data');
    }
}); */

// Profile Route - Display user profile page
/* app.get('/profile', checkAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id); // for fetching the logged-in user from DB
        if (user) {
            res.render('index.ejs', { name: req.user.name, user }); // Pass user data to the view
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Error fetching user data');
    }
});

// Route to handle profile updates
app.post('/updateProfile', checkAuthenticated, async (req, res) => {
    const { bio, skillsDesired, skillsHave } = req.body; // Get form data
    try {
        const user = await User.findById(req.user._id); // Fetch user from DB

        // Update the user's profile with new data
        user.bio = bio;
        user.skillsDesired = skillsDesired.split(',').map((skill) => skill.trim()); // Split and trim skills
        user.skillsHave = skillsHave.split(',').map((skill) => skill.trim());

        await user.save(); // to save updated data to DB

        res.redirect('/profile'); // Redirect back to profile page
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).send('Error updating user profile');
    }
});
*/


/* app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs');
});

app.post(
    '/login',
    checkNotAuthenticated,
    passport.authenticate('local', {
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash: true,
    }),
);

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs');
});

app.post('/register', checkNotAuthenticated, async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.redirect('/register');
    }
});

app.delete('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error logging out');
        }
        res.redirect('/login');
    });
});
*/

//matches route
/* app.get('/matchesPage', checkAuthenticated, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id); // Fetch the current logged-in user

        if (!currentUser) {
            return res.status(404).send('Current user not found');
        }

        // Fetch all users except the current user
        const allUsers = await User.find({ _id: { $ne: req.user._id } });

        // Filter users with similar desired skills
        const matches = allUsers.filter((user) => {
            const hasMatchingSkill = user.skillsHave.some((skill) => currentUser.skillsDesired.includes(skill));
            return hasMatchingSkill;
        });

        // Render matches.ejs and pass the user and matches data
        res.render('matches.ejs', { user: currentUser, matches });
    } catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).send('Error fetching matches');
    }
}); */

// Chat Route
/* app.get('/chat/:id', checkAuthenticated, async (req, res) => {
    try {
        const matchedUserId = req.params.id; // ID of the user to chat with
        const matchedUser = await User.findById(matchedUserId); // Fetch matched user details

        if (!matchedUser) {
            return res.status(404).send('User not found');
        }

        res.render('chat.ejs', {
            user: req.user, // Current logged-in user
            matchedUser, // Matched user to chat with
        });
    } catch (error) {
        console.error('Error fetching chat data:', error);
        res.status(500).send('Error fetching chat data');
    }
}); */

// Auth Middleware
/* function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return res.redirect('/');
    next();
} */

/* app.post('/messages', async (req, res) => {
    try {
        const { senderId, receiverId, message, chatId } = req.body;

        // Validate request
        if (!senderId || !receiverId || !message || !chatId) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Create new message
        const newMessage = new Message({
            senderId,
            receiverId,
            message,
            chatId,
        });

        // Save message to database
        await newMessage.save();

        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//fetching a message
app.get('/messages', async (req, res) => {
    try {
        // Get senderId and receiverId from the query parameters (sent from the frontend)
        const { senderId, receiverId } = req.query;

        // Check if both senderId and receiverId are provided in the request
        if (!senderId || !receiverId) {
            return res.status(400).json({ error: 'senderId and receiverId are required' });
        }

        // Find messages where:
        // - senderId sent a message to receiverId
        // - OR receiverId sent a message to senderId
        const messages = await Message.find({
            $or: [
                { senderId, receiverId }, // Messages sent by senderId to receiverId
                { senderId: receiverId, receiverId: senderId }, // Messages sent by receiverId to senderId
            ],
        }).sort({ createdAt: 1 }); // Sort messages from oldest to newest

        // If no messages found, return an empty array instead of an error
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}); */
