import Chat from '../models/Chat.js';
import Message from '../models/Message.js';

export const sendMessage = async (req, res) => {
  try {
    const { chatId, content, receiverId } = req.body;
    if (!chatId || !content) return res.status(400).json({ message: 'chatId and content are required' });
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    if (!chat.participants.map(String).includes(String(req.user._id))) {
      return res.status(403).json({ message: 'Not a participant' });
    }

    const message = await Message.create({ chatId, senderId: req.user._id, receiverId, content });
    chat.lastMessageAt = new Date();
    await chat.save();
    res.json(message);
  } catch (e) {
    res.status(500).json({ message: 'Failed to send message' });
  }
};


