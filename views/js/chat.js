// import { io } from 'socket.io-client'; (Removed this cause using in browser)

document.addEventListener("DOMContentLoaded", () => {
  // Get DOM elements after the page is fully loaded
  const chatForm = document.getElementById("chat-form");
  const chatBox = document.getElementById("chat-box");
  const messageInput = chatForm ? chatForm.querySelector('input[name="message"]') : null;

  if (!chatForm || !chatBox || !messageInput) {
    console.error("Error: Missing chat form elements. Skipping script...");
    return; // Stops the script if elements are missing
  }

  // Initialize Socket.IO with the correct server URL  
  const socket = io("http://localhost:8001", {
    transports: ["websocket"],
    withCredentials: true, // Handles authentication sessions if needed
  });

  // **Retrieve User IDs from EJS template**
  /*const currentUserId = "67f0320e5910f87821220891";
  const matchedUserId = "67f0320e5910f87821220892"; */

  const currentUserId = "<%= user._id %>";
  const matchedUserId = "<%= matchedUser._id %>";


  if (!currentUserId || !matchedUserId) {
    console.error("Error: Missing user IDs!", { currentUserId, matchedUserId });
    return; 
  }

  // **Fetch previous messages when the page loads**
  async function fetchMessages() {
    console.log(currentUserId);
    console.log(matchedUserId)   
    try { 
      
      const response = await fetch(`http://localhost:8001/messages?senderId=${currentUserId}&receiverId=${matchedUserId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const messages = await response.json();
  
      // Debugging: Log the messages to check their structure
      console.log("Fetched messages:", messages);
  
      if (Array.isArray(messages)) {
        messages.forEach(msg => {
          appendMessage(msg.sender === currentUserId ? "You" : "Them", msg.message);
        });
      } else {
        console.error("Error: Messages are not an array", messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }  

  // Call fetchMessages when the page loads
  (async () => {
    await fetchMessages();
  })();  

  // **Handle message submission**
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevents page reload
    const message = messageInput.value.trim();

    if (message) {
      // **Send message to server**
      socket.emit("sendMessage", {
        sender: currentUserId,
        receiver: matchedUserId,
        message: message,
      });

      // **Display message in the chat box**
      appendMessage("You", message);
      messageInput.value = ""; // Clears input field
    }
  });

  // **Listen for new messages from the server**
  socket.on("newMessage", (data) => {
    if (data.sender !== currentUserId) {
      appendMessage("Them", data.message);
    }
  });

  // **Function to display messages**
  function appendMessage(sender, content) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    messageElement.innerHTML = `<strong>${sender}:</strong> ${content}`;
    chatBox.appendChild(messageElement);

    // Scroll chat box to the bottom
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  console.log("Chat script loaded successfully!");
});
