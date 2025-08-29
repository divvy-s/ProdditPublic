import { io } from 'socket.io-client';

let socketInstance = null;

export const getSocket = (token) => {
  if (!socketInstance) {
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    socketInstance = io(socketUrl, {
      autoConnect: false,
      withCredentials: true,
    });
  }
  if (token) {
    socketInstance.auth = { token };
    if (!socketInstance.connected) socketInstance.connect();
  }
  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    try { socketInstance.removeAllListeners(); } catch {}
    if (socketInstance.connected) socketInstance.disconnect();
    socketInstance = null;
  }
};


