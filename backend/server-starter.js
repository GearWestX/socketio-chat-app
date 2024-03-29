// imports required for server
import { uniqueNamesGenerator, colors, names } from "unique-names-generator";
import express from "express";
import http from "http";

//Socket.io Library
import {Server} from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);


//Main storage for every chat session
const chatHistory = [];

//Connection code 
io.on("connection", function callback(socket) {
  const username = getUniqueUserName();
  console.log(`${username} connected`);

//Send chat history to client
socket.emit("receive-messages", {
  chatHistory: getAllMessages(),
  username,

});  

//User send messages and Socket object listens
socket.on("post-message", function receiveMessage(data) {
  const { message } = data || { message: "" };

  chatHistory.push({
    username,
    message,

  });

  //Send updated chat to all clients
  io.emit("receive-messages", {
    chatHistory: getAllMessages(),

  });
});

//Listen and log the disconnect events
socket.on("disconnect", ()  => {
  console.log(`{$username} disconnected`)
});

});


//HTTP Server setup for page assets
app.use(express.static(process.cwd() + "/frontend"));


//HTTP server setup to serve the page at /
app.get("/", (req, res) => {
  return res.sendFile(process.cwd() + "/frontend/index.html");
});


// start the HTTP server to serve the page
server.listen(4000, () => {
  console.log("listening on http://localhost:4000");
});


//Get all messages in the order they were sent
function getAllMessages() {
  return Array.from(chatHistory).reverse();
}

//Generate unique usernames for each client
function getUniqueUserName() {
  return uniqueNamesGenerator({
    dictionaries: [names, colors],
    length: 2,
    style: "capital",
    separator: " ",

  });
}