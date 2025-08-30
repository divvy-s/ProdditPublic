import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import voteRoutes from './routes/voteRoutes.js';
import userRoutes from './routes/userRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import studyRoomRoutes from './routes/studyRoomRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import Message from './models/Message.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

connectDB();

const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/posts', voteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/studyrooms', studyRoomRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/habits', habitRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const io = new SocketIOServer(server, {
  cors: {
    origin: corsOrigins,
    credentials: true
  }
});

const onlineUsers = new Map();

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) return next(new Error('No token'));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (e) {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  if (socket.userId) {
    onlineUsers.set(String(socket.userId), socket.id);
    io.emit('presence:update', Array.from(onlineUsers.keys()));
  }

  socket.on('chat:join', (chatId) => {
    socket.join(`chat:${chatId}`);
  });

  socket.on('chat:message', async (payload) => {
    try {
      const { chatId, content, receiverId } = payload || {};
      if (!chatId || !content) return;
      const message = await Message.create({ chatId, senderId: socket.userId, receiverId, content });
      const populated = await Message.findById(message._id).populate('senderId', 'username');
      const shaped = { ...populated.toObject(), senderName: populated.senderId?.username };
      io.to(`chat:${chatId}`).emit('chat:message', shaped);
    } catch (e) {
      console.log(e);
    }
  });

  socket.on('room:join', (roomId) => {
    socket.join(`room:${roomId}`);
    io.to(`room:${roomId}`).emit('room:presence', { userId: socket.userId, action: 'join' });
  });

  socket.on('room:leave', (roomId) => {
    socket.leave(`room:${roomId}`);
    io.to(`room:${roomId}`).emit('room:presence', { userId: socket.userId, action: 'leave' });
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(String(socket.userId));
      io.emit('presence:update', Array.from(onlineUsers.keys()));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Proddit server running on port ${PORT}`);
});
