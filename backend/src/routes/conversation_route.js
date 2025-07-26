const express = require('express');
const router = express.Router();
const Conversation = require('../model/Conversation');
const axios = require('axios');
const API_KEY = process.env.GROQ_API_KEY;

// AI response function
async function getGroqResponse(messages) {
  const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
    model: 'llama-3-8b-8192',
    messages: messages
  }, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data.choices[0].message.content;
}

// POST /api/chat - Send message, get AI response
router.post('/chat', async (req, res) => {
  const { userId, message, conversation_id } = req.body;
  let conversation;
console.log(`Using Groq API Key: ${process.env.GROQ_API_KEY}`);

  if (conversation_id) {
    conversation = await Conversation.findById(conversation_id);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
  } else {
    conversation = new Conversation({ userId, messages: [] });
  }

  // Add user message to conversation
  conversation.messages.push({ sender: 'user', text: message, timestamp: new Date() });

  // Prepare messages for Groq (history + new message)
  const groqMessages = conversation.messages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text
  }));

  // Get AI response from Groq
  const aiResponse = await getGroqResponse(groqMessages);

  // Add AI response to conversation
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

