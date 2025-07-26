const express = require('express');
const mongoose = require('mongoose');
const Conversation = require('./model/Conversation');

const app = express();
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/ecommerce_chatbot');

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.log(`MongoDB connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('Disconnected from MongoDB');
});
app.listen(3000, () => console.log('Server running on port 3000'));