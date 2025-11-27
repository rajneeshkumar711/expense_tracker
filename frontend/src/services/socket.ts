import { io, Socket } from 'socket.io-client';
import { Expense } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    const serverUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

    this.socket = io(serverUrl, {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Set up event listeners
    this.socket.on('expense:created', (expense: Expense) => {
      this.emit('expense:created', expense);
    });

    this.socket.on('expense:updated', (expense: Expense) => {
      this.emit('expense:updated', expense);
    });

    this.socket.on('expense:statusChanged', (expense: Expense) => {
      this.emit('expense:statusChanged', expense);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
