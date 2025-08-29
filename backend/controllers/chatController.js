import Chat from '../models/Chat.js';
import Message from '../models/Message.js';

export const createDM = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user._id;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    let chat = await Chat.findOne({ type: 'dm', participants: { $all: [currentUserId, userId], $size: 2 } });
    if (!chat) {
      chat = await Chat.create({ type: 'dm', participants: [currentUserId, userId], createdBy: currentUserId });
    }
    const populated = await Chat.findById(chat._id).populate('participants', 'username profilePicture');
    res.json(populated);
  } catch (e) {
    res.status(500).json({ message: 'Failed to create/find DM' });
  }
};

export const createGroup = async (req, res) => {
  try {
    const { name, participantIds, isPublic } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required' });
    const uniqueParticipants = Array.from(new Set([...(participantIds || []), String(req.user._id)]));
    const chat = await Chat.create({ type: 'group', name, participants: uniqueParticipants, isPublic: !!isPublic, createdBy: req.user._id });
    const populated = await Chat.findById(chat._id).populate('participants', 'username profilePicture');
    res.json(populated);
  } catch (e) {
    res.status(500).json({ message: 'Failed to create group' });
  }
};

export const getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({ $or: [ { participants: req.user._id }, { isPublic: true } ] })
      .sort({ lastMessageAt: -1 })
      .populate('participants', 'username profilePicture');
    res.json(chats);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch chats' });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId }).sort({ createdAt: 1 }).populate('senderId', 'username');
    const shaped = messages.map((m) => ({ ...m.toObject(), senderName: m.senderId?.username }));
    res.json(shaped);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

export const listPublicChats = async (req, res) => {
  try {
    const chats = await Chat.find({ type: 'group', isPublic: true })
      .sort({ createdAt: -1 })
      .select('_id name isPublic createdAt participants createdBy');
    res.json(chats);
  } catch (e) {
    res.status(500).json({ message: 'Failed to list public chats' });
  }
};

export const joinPublicChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isPublic) return res.status(404).json({ message: 'Public chat not found' });
    const userId = String(req.user._id);
    if (!chat.participants.map(String).includes(userId)) {
      chat.participants.push(userId);
      await chat.save();
    }
    const populated = await Chat.findById(chatId).populate('participants', 'username profilePicture');
    res.json(populated);
  } catch (e) {
    res.status(500).json({ message: 'Failed to join public chat' });
  }
};

export const setChatPublic = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { isPublic } = req.body;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    
    if (!chat.participants.map(String).includes(String(req.user._id))) {
      return res.status(403).json({ message: 'Not authorized to modify this chat' });
    }
    chat.isPublic = !!isPublic;
    await chat.save();
    const populated = await Chat.findById(chatId).populate('participants', 'username profilePicture');
    res.json(populated);
  } catch (e) {
    res.status(500).json({ message: 'Failed to update chat visibility' });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    if (String(chat.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the creator can delete this chat' });
    }
    await Message.deleteMany({ chatId });
    await chat.deleteOne();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: 'Failed to delete chat' });
  }
};


