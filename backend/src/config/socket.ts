import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';

let io: SocketIOServer;

export const initializeSocket = (server: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      socket.data.userId = decoded.id;
      socket.data.role = decoded.role;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.userId}`);

    socket.join(`user:${socket.data.userId}`);

    if (socket.data.role === 'ADMIN') {
      socket.join('admins');
    }

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.userId}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const emitExpenseCreated = (expense: any) => {
  if (io) {
    io.to(`user:${expense.userId}`).emit('expense:created', expense);
    
    io.to('admins').emit('expense:created', expense);
  }
};

export const emitExpenseUpdated = (expense: any) => {
  if (io) {
    io.to(`user:${expense.userId}`).emit('expense:updated', expense);
    
    io.to('admins').emit('expense:updated', expense);
  }
};

export const emitExpenseStatusChanged = (expense: any) => {
  if (io) {
    io.to(`user:${expense.userId}`).emit('expense:statusChanged', expense);
  }
};
