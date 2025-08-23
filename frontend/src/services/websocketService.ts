import { io, Socket } from 'socket.io-client';
import getAuthToken from "@/utils/auth";

class WebSocketService {
  private socket: Socket | null = null;

  connect(showId: number) {
    if (this.socket) {
      this.disconnect();
    }

    const authToken = getAuthToken();


    const backendUrl = process.env.NODE_ENV === 'production'
      ? process.env.API_BASE_URL
      : 'http://localhost:3000';

    this.socket = io(backendUrl, {
      extraHeaders: {
        Authorization: `Bearer ${authToken}`,
      }
    });

    this.socket.emit('joinShow', showId);

    console.log("Socket connection was successfull");

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }


  selectSeat(seatId: string, showId: string | undefined) {
    if (this.socket) {
      this.socket.emit('seatSelected', { seatId, showId });
    }
  }

  deselectSeat(seatId: string, showId: string | undefined) {
    if (this.socket) {
      this.socket.emit('seatDeselected', { seatId, showId });
    }
  }

  onInitialBlockedSeats(callback: (blockedSeats: string[]) => void) {
    if (this.socket) {
      this.socket.on('initialBlockedSeats', callback);
    }


  }

  onSeatBlocked(callback: (seatId: string) => void) {
    if (this.socket) {
      this.socket.on('seatBlocked', callback);
    }
  }

  onSeatUnblocked(callback: (seatId: string) => void) {
    console.log("Seat has been unblocked");
    if (this.socket) {
      this.socket.on('seatUnblocked', callback);
    }
  }

  onSeatAlreadyBlocked(callback: (seatId: string) => void) {
    if (this.socket) {
      this.socket.on('seatAlreadyBlocked', callback);
    }
  }

  onSeatBooked(callback: (seats: string[]) => void) {
    if (this.socket) {
      this.socket.on('seatBooked', callback);
    }
  }

  onSeatUnbooked(callback: (data: { seatId: string, showId: string }) => void) {
    if (this.socket) {
      this.socket.on('seatUnbooked', callback);
    }
  }
}

export const websocketService = new WebSocketService();
