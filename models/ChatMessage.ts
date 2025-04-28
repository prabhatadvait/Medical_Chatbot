import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index for efficient queries
ChatMessageSchema.index({ userId: 1, timestamp: -1 });

export const ChatMessage = mongoose.models.ChatMessage || mongoose.model('ChatMessage', ChatMessageSchema);
