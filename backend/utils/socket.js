let ioInstance;

const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    // Client joins a room named after their own userId right after login
    socket.on('join', (userId) => {
      if (userId) socket.join(userId.toString());
    });

    socket.on('disconnect', () => {
      // no-op, room membership cleans up automatically
    });
  });
};

// Emit a real-time event to a specific user's room
const emitToUser = (userId, event, payload) => {
  if (!ioInstance || !userId) return;
  ioInstance.to(userId.toString()).emit(event, payload);
};

module.exports = { initSocket, emitToUser };
