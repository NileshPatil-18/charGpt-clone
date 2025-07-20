const express = require('express');
const router = express.Router();
const {
  createChat,
  sendMessage,
  getChats,
  getChatMessages,
  stopMessage,
  updateChatTitle
} = require('../controllers/chatController');

router.post('/chat', createChat);
router.get('/chats', getChats);
router.get('/chat/:chatId/messages', getChatMessages);
router.get('/chat/:chatId/message/stream', sendMessage); // Changed to GET for SSE
router.post('/chat/:chatId/stop', stopMessage);
router.patch('/chat/:chatId', updateChatTitle); 

module.exports = router;