const express = require('express');
const router = express.Router();
const Conversation = require('../model/Conversation');

// Dummy AI response function
function getAIResponse(userMessage) {
  return `AI response to: "${userMessage}"`;
}

// POST /api/chat - Send message, get AI response, persist both
router.post('/chat', async (req, res) => {
  const { userId, message, conversation_id } = req.body;
  let conversation;

  if (conversation_id) {
    conversation = await Conversation.findById(conversation_id);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
  } else {
    conversation = new Conversation({ userId, messages: [] });
  }

  conversation.messages.push({ sender: 'user', text: message, timestamp: new Date() });

  const aiResponse = getAIResponse(message);
  conversation.messages.push({ sender: 'ai', text: aiResponse, timestamp: new Date() });

  await conversation.save();

  res.json({
    conversation_id: conversation._id,
    ai_response: aiResponse,
    messages: conversation.messages
  });
});

//Get all conversations for a user
router.get('/conversations/:userId', async (req, res) => {
  const conversations = await Conversation.find({ userId: req.params.userId });
  res.json(conversations);
});

//  Get full message history for a conversation
router.get('/conversation/:conversationId', async (req, res) => {
  const conversation = await Conversation.findById(req.params.conversationId);
  if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
  res.json(conversation);
});

//  Start a new conversation for a user
router.post('/conversations', async (req, res) => {
  const { userId } = req.body;
  const conversation = new Conversation({ userId, messages: [] });
  await conversation.save();
  res.json(conversation);
});

module.exports = router;

