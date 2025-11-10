// import { Server } from "http";
// import { WebSocket, WebSocketServer } from "ws";


// import { JsonWebTokenError } from "jsonwebtoken";
// import { jwtHelpers } from "../../helpars/jwtHelpers";
// import config from "../../config";
// import prisma from "../prisma";


// interface ExtendedWebSocket extends WebSocket {
//   userId?: string;
// }

// const ONLINE_USERS_KEY = "online_users";
// export const onlineUsers = new Set<string>();
// const userSockets = new Map<string, ExtendedWebSocket>();

// export async function setupWebSocket(server: Server) {
//   const wss = new WebSocketServer({ server });
//   console.log("WebSocket server is running");

//   wss.on("connection", (ws: ExtendedWebSocket) => {
  

//     ws.on("message", async (data: string) => {
//       try {
//         const parsedData = JSON.parse(data);

//         switch (parsedData.event) {
//           case "authenticate": {
//             const token = parsedData.token;

//             if (!token) {
//               console.log("No token provided");
//               ws.close();
//               return;
//             }

//             const user = jwtHelpers.verifyToken(
//               token,
//               config.jwt.jwt_secret as string
//             );

//             if (!user) {
//               console.log("Invalid token");
//               ws.close();
//               return;
//             }

//             const { id } = user;

//             ws.userId = id;
//             onlineUsers.add(id);

//             userSockets.set(id, ws);

//             broadcastToAll(wss, {
//               event: "userStatus",
//               data: { userId: id, isOnline: true },
//             });
//             break;
//           }

//           case "message": {
//             const { receiverId, message, images } = parsedData;

//             if (!ws.userId || !receiverId || !message) {
//               console.log("Invalid message payload");
//               return;
//             }

//             let room = await prisma.room.findFirst({
//               where: {
//                 OR: [
//                   { senderId: ws.userId, receiverId },
//                   { senderId: receiverId, receiverId: ws.userId },
//                 ],
//               },
//             });

//             if (!room) {
//               room = await prisma.room.create({
//                 data: { senderId: ws.userId, receiverId },
//               });
//             }

//             const chat = await prisma.chat.create({
//               data: {
//                 senderId: ws.userId,
//                 receiverId,
//                 roomId: room.id,
//                 message,
//                 images: { set: images || [] },
//               },
//             });

//             const receiverSocket = userSockets.get(receiverId);
//             if (receiverSocket) {
//               receiverSocket.send(
//                 JSON.stringify({ event: "message", data: chat })
//               );
//             }
//             ws.send(JSON.stringify({ event: "message", data: chat }));
//             break;
//           }
//           case "project": {
//             ws.send(JSON.stringify({ parsedData }));
//             return;
//           }

//           case "fetchChats": {
//             const { receiverId } = parsedData;
//             if (!ws.userId) {
//               console.log("User not authenticated");
//               return;
//             }

//             const room = await prisma.room.findFirst({
//               where: {
//                 OR: [
//                   { senderId: ws.userId, receiverId },
//                   { senderId: receiverId, receiverId: ws.userId },
//                 ],
//               },
//             });

//             if (!room) {
//               ws.send(JSON.stringify({ event: "fetchChats", data: [] }));
//               return;
//             }

//             const chats = await prisma.chat.findMany({
//               where: { roomId: room.id },
//               orderBy: { createdAt: "asc" },
//             });

//             await prisma.chat.updateMany({
//               where: { roomId: room.id, receiverId: ws.userId },
//               data: { isRead: true },
//             });

//             ws.send(
//               JSON.stringify({
//                 event: "fetchChats",
//                 data: chats,
//               })
//             );
//             break;
//           }
//           case "onlineUsers": {
//             const onlineUserList = Array.from(onlineUsers);
//             const user = await prisma.user.findMany({
//               where: { id: { in: onlineUserList } },
//               select: {
//                 id: true,
//                 email: true,
               

           
            
//                 role: true,
//               },
//             });
//             ws.send(
//               JSON.stringify({
//                 event: "onlineUsers",
//                 data: user,
//               })
//             );
//             break;
//           }

//           case "unReadMessages": {
//             const { receiverId } = parsedData;
//             if (!ws.userId || !receiverId) {
//               console.log("Invalid unread messages payload");
//               return;
//             }

//             const room = await prisma.room.findFirst({
//               where: {
//                 OR: [
//                   { senderId: ws.userId, receiverId },
//                   { senderId: receiverId, receiverId: ws.userId },
//                 ],
//               },
//             });

//             if (!room) {
//               ws.send(JSON.stringify({ event: "noUnreadMessages", data: [] }));
//               return;
//             }

//             const unReadMessages = await prisma.chat.findMany({
//               where: { roomId: room.id, isRead: false, receiverId: ws.userId },
//             });

//             const unReadCount = unReadMessages.length;

//             ws.send(
//               JSON.stringify({
//                 event: "unReadMessages",
//                 data: { messages: unReadMessages, count: unReadCount },
//               })
//             );
//             break;
//           }

//           case "messageList": {
//             try {
//               // Fetch all rooms where the user is involved
//               const rooms = await prisma.room.findMany({
//                 where: {
//                   OR: [{ senderId: ws.userId }, { receiverId: ws.userId }],
//                 },
//                 include: {
//                   chat: {
//                     orderBy: {
//                       createdAt: "desc",
//                     },
//                     take: 1, // Fetch only the latest message for each room
//                   },
//                 },
//               });

//               // Extract the relevant user IDs from the rooms
//               const userIds = rooms.map((room) => {
//                 return room.senderId === ws.userId
//                   ? room.receiverId
//                   : room.senderId;
//               });

//               // Fetch user profiles for the corresponding user IDs
//               const userInfos = await prisma.user.findMany({
//                 where: {
//                   id: {
//                     in: userIds,
//                   },
//                 },
//                 select: {
//                   profileImage: true,
//                   fullName: true,
//                   id: true,
//                 },
//               });

//               // Combine user info with their last message
//               const userWithLastMessages = rooms.map((room) => {
//                 const otherUserId =
//                   room.senderId === ws.userId ? room.receiverId : room.senderId;
//                 const userInfo = userInfos.find(
//                   (userInfo) => userInfo.id === otherUserId
//                 );

//                 return {
//                   user: userInfo || null,
//                   lastMessage: room.chat[0] || null,
//                 };
//               });

//               // Send the result back to the requesting client
//               ws.send(
//                 JSON.stringify({
//                   event: "messageList",
//                   data: userWithLastMessages,
//                 })
//               );
//             } catch (error) {
//               console.error(
//                 "Error fetching user list with last messages:",
//                 error
//               );
//               ws.send(
//                 JSON.stringify({
//                   event: "error",
//                   message: "Failed to fetch users with last messages",
//                 })
//               );
//             }
//             break;
//           }

//           default:
//             console.log("Unknown event type:", parsedData.event);
//         }
//       } catch (error) {
//         console.error("Error handling WebSocket message:", error);
//       }
//     });

//     ws.on("close", () => {
//       if (ws.userId) {
//         onlineUsers.delete(ws.userId);
//         userSockets.delete(ws.userId);

//         broadcastToAll(wss, {
//           event: "userStatus",
//           data: { userId: ws.userId, isOnline: false },
//         });
//       }
//       console.log("User disconnected");
//     });
//   });

//   return wss;
// }

// function broadcastToAll(wss: WebSocketServer, message: object) {
//   wss.clients.forEach((client) => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(JSON.stringify(message));
//     }
//   });
// }



import { Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { jwtHelpers } from "../../helpars/jwtHelpers";
import config from "../../config";
import prisma from "../prisma";

interface ExtendedWebSocket extends WebSocket {
  userId?: string;
  role?: string;
}

export const onlineUsers = new Set<string>();
const userSockets = new Map<string, ExtendedWebSocket>();

export async function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });
  console.log("WebSocket server is running");

  wss.on("connection", (ws: ExtendedWebSocket) => {
    ws.on("message", async (data: string) => {
      console.log("received message");
      try {
        const parsedData = JSON.parse(data);

        switch (parsedData.event) {
          case "authenticate": {
            console.log("authenticate");
            console.log(parsedData);
            const token = parsedData.token;
            console.log(token);
            if (!token) return ws.close();

            const user = jwtHelpers.verifyToken(token, config.jwt.jwt_secret as string);
            console.log(user);
            if (!user) return ws.close();

            ws.userId = user.id;
            ws.role = user.role;
            onlineUsers.add(user.id);
            userSockets.set(user.id, ws);

            broadcastToAll(wss, {
              event: "userStatus",
              data: { userId: user.id, isOnline: true },
            });
            break;
          }

          case "message": {
            const { roomId, receiverId, message } = parsedData;
            if (!ws.userId || !message) return;

            let room;

            if (ws.role === "ADMIN" && roomId) {
              room = await prisma.room.findUnique({
                where: { id: roomId },
                include: { participants: true },
              });
            } else {
              room = await prisma.room.findFirst({
                where: {
                  type: "PRIVATE",
                  participants: {
                    every: {
                      userId: { in: [ws.userId, receiverId] },
                    },
                  },
                },
                include: { participants: true },
              });

              if (!room) {
                room = await prisma.room.create({
                  data: {
                    type: "PRIVATE",
                    participants: {
                      create: [
                        { userId: ws.userId, role: "USER" },
                        { userId: receiverId, role: "USER" },
                      ],
                    },
                  },
                  include: { participants: true },
                });
              }

              const senderParticipant = room.participants.find(p => p.userId === ws.userId);
              if (senderParticipant?.role === "ADMIN" && room.type === "PRIVATE") {
                await prisma.room.update({
                  where: { id: room.id },
                  data: { type: "GROUP" },
                });
              }

              const alreadyInRoom = room.participants.some(p => p.userId === ws.userId);
              if (!alreadyInRoom) {
                await prisma.roomParticipant.create({
                  data: { userId: ws.userId, roomId: room.id, role: "ADMIN" },
                });
              }
            }

            if (!room) return;

            const chat = await prisma.chat.create({
              data: {
                senderId: ws.userId,
                roomId: room.id,
                message,
              },
            });

            for (const participant of room.participants) {
              const socket = userSockets.get(participant.userId);
              if (socket) {
                socket.send(JSON.stringify({ event: "message", data: chat }));
              }
            }

            break;
          }

          case "fetchChats": {
            const { receiverId } = parsedData;
            if (!ws.userId) return;

            const room = await prisma.room.findFirst({
              where: {
                type: "PRIVATE",
                participants: {
                  every: {
                    userId: { in: [ws.userId, receiverId] },
                  },
                },
              },
            });

            if (!room) {
              ws.send(JSON.stringify({ event: "fetchChats", data: [] }));
              return;
            }

            const chats = await prisma.chat.findMany({
              where: { roomId: room.id },
              orderBy: { createdAt: "asc" },
            });

            ws.send(JSON.stringify({ event: "fetchChats", data: chats }));
            break;
          }

          case "unReadMessages": {
            const { receiverId } = parsedData;
            if (!ws.userId || !receiverId) return;

            const room = await prisma.room.findFirst({
              where: {
                type: "PRIVATE",
                participants: {
                  every: {
                    userId: { in: [ws.userId, receiverId] },
                  },
                },
              },
            });

            if (!room) {
              ws.send(JSON.stringify({ event: "noUnreadMessages", data: [] }));
              return;
            }

            const unReadMessages = await prisma.chat.findMany({
              where: {
                roomId: room.id,
                senderId: receiverId,
              },
            });

            ws.send(JSON.stringify({
              event: "unReadMessages",
              data: { messages: unReadMessages, count: unReadMessages.length },
            }));
            break;
          }

          case "onlineUsers": {
            const onlineUserList = Array.from(onlineUsers);
            const users = await prisma.user.findMany({
              where: { id: { in: onlineUserList } },
              select: { id: true, email: true, role: true },
            });

            ws.send(JSON.stringify({ event: "onlineUsers", data: users }));
            break;
          }

          case "messageList": {
            if (!ws.userId) return;

            const rooms = await prisma.room.findMany({
              where: {
                participants: {
                  some: { userId: ws.userId },
                },
              },
              include: {
                participants: true,
                chats: {
                  orderBy: { createdAt: "desc" },
                  take: 1,
                },
              },
            });

            const lastMessages = await Promise.all(
              rooms.map(async (room) => {
                const otherParticipant = room.participants.find(p => p.userId !== ws.userId);
                const user = otherParticipant
                  ? await prisma.user.findUnique({ where: { id: otherParticipant.userId } })
                  : null;
                return {
                  user,
                  lastMessage: room.chats[0] || null,
                };
              })
            );

            ws.send(JSON.stringify({ event: "messageList", data: lastMessages }));
            break;
          }

          default:
            console.log("Unknown event type:", parsedData.event);
        }
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
      }
    });

    ws.on("close", () => {
      if (ws.userId) {
        onlineUsers.delete(ws.userId);
        userSockets.delete(ws.userId);

        broadcastToAll(wss, {
          event: "userStatus",
          data: { userId: ws.userId, isOnline: false },
        });
      }
      console.log("User disconnected");
    });
  });

  return wss;
}

function broadcastToAll(wss: WebSocketServer, message: object) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}
