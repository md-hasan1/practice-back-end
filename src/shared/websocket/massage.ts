import { CloudFormation } from "aws-sdk";
import { Server } from "http";
import { json } from "stream/consumers";
import WebSocket  from "ws"



// Initialize a WebSocket server
export  const initializeWebSocketServer = (server:Server) => {
  const wss = new WebSocket.Server({ server });

  const onlineUsers =  []
  console.log("WebSocket server initialized");

  // Handle new connections
  wss.on("connection", (ws) => {
   

    // Send a welcome message to the client
    ws.send(JSON.stringify({ message: "Welcome to the WebSocket server!" }));

    // Handle messages from the client
    ws.on("message", (data) => {
     
        const decodedMessage = data.toString();
        const parsedMessage = JSON.parse(decodedMessage);
        
        
        // const{senderId,receiverId,type,message}=parsedMessage
   onlineUsers.push({user:parsedMessage.senderId,isOnline:true})
      // Example: Echo the message back to the client
      ws.send(JSON.stringify(parsedMessage));
      
    });

    // Handle connection closure
    ws.on("close", () => {
      console.log("Client disconnected");
    });

    // Handle errors
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  return wss;
};


