import StudyRoom from '../models/StudyRoom.js';
import StudySession from '../models/StudySession.js';

export const createRoom = async (req, res) => {
  try {
    const { name, description } = req.body;
    const room = await StudyRoom.create({ name, description, members: [req.user._id] });
    res.json(room);
  } catch (e) {
    res.status(500).json({ message: 'Failed to create room' });
  }
};

export const listRooms = async (req, res) => {
  try {
    const rooms = await StudyRoom.find().sort({ createdAt: -1 });
    res.json(rooms);
  } catch (e) {
    res.status(500).json({ message: 'Failed to list rooms' });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await StudyRoom.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (!room.members.map(String).includes(String(req.user._id))) {
      room.members.push(req.user._id);
      await room.save();
    }
    const session = await StudySession.create({ roomId, userId: req.user._id, joinTime: new Date() });
    res.json({ room, session });
  } catch (e) {
    res.status(500).json({ message: 'Failed to join room' });
  }
};

export const leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const session = await StudySession.findOne({ roomId, userId: req.user._id }).sort({ createdAt: -1 });
    if (!session) return res.status(404).json({ message: 'Active session not found' });
    if (!session.leaveTime) {
      session.leaveTime = new Date();
      session.totalTime += session.leaveTime - session.joinTime;
      await session.save();
    }
    res.json(session);
  } catch (e) {
    res.status(500).json({ message: 'Failed to leave room' });
  }
};

export const roomActiveTimes = async (req, res) => {
  try {
    const { roomId } = req.params;
    const sessions = await StudySession.find({ roomId }).populate('userId', 'username');
    const totalsByUserId = {};
    const usernameByUserId = {};
    sessions.forEach((session) => {
      const userIdStr = String(session.userId._id);
      const username = session.userId.username;
      const durationMs = (session.leaveTime ? session.leaveTime : new Date()) - session.joinTime;
      usernameByUserId[userIdStr] = username;
      totalsByUserId[userIdStr] = (totalsByUserId[userIdStr] || 0) + (session.totalTime || 0) + durationMs;
    });
    const result = Object.entries(totalsByUserId).map(([userId, totalMs]) => ({ userId, username: usernameByUserId[userId], totalMs }));
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: 'Failed to get active times' });
  }
};


