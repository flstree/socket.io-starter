import { Server } from "socket.io";
import { WEBSOCKET_EVENTS } from "./websocket.interface";
import express from 'express';

export class AppWebSocket {
  io;
  connections = {};

  constructor(httpServer) {
    this.io = new Server(httpServer, {
      pingTimeout: 60000,
      cors: {
        origin: "*",
        // credentials: true,
      },
    });
  }

  getIO() {
    return this.io;
  }

  registerProfile = (profileId, connectionId) => {
    if (this.connections[profileId] === undefined) {
      this.connections[profileId] = {};
    }

    this.connections[profileId][connectionId] = null;
    console.log(
      "Registered connection " +
        connectionId.substring(0, 4) +
        "*** for user " +
        profileId,
    );
  };

  registerSocket = (
    profileId,
    connectionId,
    socket,
  ) => {
    if (
      this.connections[profileId] != null &&
      this.connections[profileId][connectionId] == null
    ) {
      socket.profileId = profileId;
      socket.connectionId = connectionId;
      this.connections[profileId][connectionId] = socket;
      console.log(
        "Registered socket for connection " +
          connectionId.substring(0, 4) +
          "*** and  user " +
          profileId,
      );
      return true;
    } else {
      console.log(
        "Not found empty conn for connection " +
          connectionId.substring(0, 4) +
          "*** and  user " +
          profileId,
      );
      return false;
    }
  };

  clientConnected = (socket) => {
    const profileId = socket.profileId;
    const connectionId = socket.connectionId;
    if (
      profileId &&
      connectionId &&
      this.connections[profileId] &&
      this.connections[profileId][connectionId]
    ) {
      this.io.to(socket.id).emit(WEBSOCKET_EVENTS.CLIENT_CONNECTED);
    }
  };

  removeConnection = (socket) => {
    const profileId = socket.profileId;
    const connectionId = socket.connectionId;
    if (
      profileId &&
      connectionId &&
      this.connections[profileId] &&
      this.connections[profileId][connectionId]
    ) {
      delete this.connections[profileId][connectionId];
    }
  };

  sendDataToUserSocket = (
    profileId,
    type = "notification",
    data,
  ) => {
    const userConnections = this.connections[profileId];
    if (userConnections) {
      for (var connectionId in userConnections) {
        if (userConnections.hasOwnProperty(connectionId)) {
          var socket = userConnections[connectionId];
          if (socket != null) {
            this.io.to(socket.id).emit(
              type,
              JSON.stringify({
                data,
              }),
            );
          }
        }
      }
    }
  };
}

const app = express();
app.set("port", PORT);

const server = app
  .listen(PORT, () => {
    return logger.info(`Server is listening on ${PORT}`);
  })
  .on("error", (e) => logger.error(e));

const socketInstance = new AppWebSocket(server);
WebSocketListener(socketInstance);
