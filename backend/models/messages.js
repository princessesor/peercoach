import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },  // Ensure senderId is required
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Ensure receiverId is required
  message: { type: String, required: true },  // Ensure message text is required
  timestamp: { type: Date, default: Date.now },  // Timestamp when the message is created
});

const Message = mongoose.model("Message", messageSchema);

export default Message;
