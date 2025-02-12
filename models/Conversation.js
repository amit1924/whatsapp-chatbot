import mongoose from "mongoose";

const conversationScheme = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  messages: [
    {
      role: {
        type: String,
        enum: ["user", "bot"],
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const Conversation = mongoose.model("Conversation", conversationScheme);

export default Conversation;
