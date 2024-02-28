export const WebSocketListener = (socketInstance) => {
    socketInstance.getIO().on("connection", (socket) => {
      socket.on("register", function (apiKey, profileId) {
        if (apiKey !== "WE") return;
        console.log(`Client connected: ${socket.id}`);
        socketInstance.registerProfile(profileId, socket.id);
        socketInstance.registerSocket(profileId, socket.id, socket);
        socketInstance.clientConnected(socket);
      });
  
      socket.on("disconnect", function () {
        socketInstance.removeConnection(socket);
      });
  
      eventEmitter.on(APP_EVENTS.NOTIFICATION_CREATED, ({ notification }) => {
        const { recipients, ...finalNotification } = notification;
  
        const isRecipient = recipients.some((recipient) => {
          const notificationSettings =
            recipient.profile.notification_settings;
          return (
            recipient.profile.id === parseInt(socket.profileId) &&
            notificationSettings[notification.action]?.push
          );
        });
  
        if (isRecipient) {
          socketInstance.sendDataToUserSocket(
            socket.profileId,
            WEBSOCKET_EVENTS.SEND_NOTIFICATION,
            {
              notification: finalNotification,
              recipient: isRecipient,
            },
          );
        }
      });
    });
  };