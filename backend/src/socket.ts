import { Server as SocketIOServer } from 'socket.io';

export const setupSocketIO = (io: SocketIOServer) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // When a client joins a specific show's room
    socket.on('joinShow', (showId) => {
      socket.join(`show-${showId}`);
      console.log(`User ${socket.id} joined room for show-${showId}`);
    });

    // When a client selects a seat
    socket.on('seatSelected', (data) => {
      console.log("Seat selected at show : ", data.showId);
      console.log(data.seatId);
      // Broadcast the selected seat to all other clients in the same room
      socket.to(`show-${data.showId}`).emit('seatBlocked', data.seatId);
    });

    // When a client deselects a seat
    socket.on('seatDeselected', (data) => {
      // Broadcast the deselected seat to all other clients in the same room
      socket.to(`show-${data.showId}`).emit('seatUnblocked', data.seatId);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
