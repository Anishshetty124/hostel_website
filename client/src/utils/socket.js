import { io } from 'socket.io-client';

let socketInstance;

export const getSocket = () => {
  if (!socketInstance) {
    const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
    socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });
  }
  return socketInstance;
};
