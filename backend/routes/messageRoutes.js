import express from "express";
import Message from "../models/messages.js"; 
//import { isObjectIdOrHexString } from "mongoose";

const router = express.Router();


// **Get messages between two users**
router.get("/", async (req, res) => {
  const { senderId, receiverId } = req.query;
  try {
    const messages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId }  
      ]
    }).sort({ timestamp: 1 });

 // Format the messages before sending them to the frontend
 const formattedMessages = messages.map(msg => ({
  _id: msg._id,
  sender: msg.senderId.toString(), // Convert ObjectId to string
  receiver: msg.receiverId.toString(), // Convert ObjectId to string
  message: msg.message,
  timestamp: msg.timestamp
}));

    res.json(formattedMessages);
  } catch (error) {
    res.status(500).json({ error: "Error fetching messages" });
  }
});

// **Save a new message**
router.post("/", async (req, res) => {
  const { senderId, receiverId, message } = req.body;
  try {
    const newMessage = new Message({ senderId, receiverId, message });
    await newMessage.save();
    res.json(newMessage);
  } catch (error) {
    console.error("Error saving message:", error);  // Log the error to console
    res.status(500).json({ error: "Error saving message" });
  }
});

export default router;
