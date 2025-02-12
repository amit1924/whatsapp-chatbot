import express from "express";
import "dotenv/config";
import pkg from "whatsapp-web.js";
import axios from "axios";
import qrcode from "qrcode-terminal";
import getJoke from "./joke.js";
import chatWithGemini from "./ai.js";
import generateImage from "./image.js";
import { franc } from "franc-min";
import connectDB from "./lib/db.js";
import Conversation from "./models/Conversation.js";
import Session from "./models/Session.js"; // New model to store session data

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("server is running");
});

const { Client, LocalAuth, MessageMedia } = pkg;

// Function to load the session from MongoDB
async function getSession() {
  const session = await Session.findOne({});
  return session ? session.data : null;
}

// Function to save the session to MongoDB
async function saveSession(data) {
  await Session.findOneAndUpdate({}, { data }, { upsert: true });
}

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("📲 Scan the above QR code with your WhatsApp.");
});

client.on("authenticated", async (session) => {
  console.log("✅ Authenticated!");
  await saveSession(session);
});

client.on("ready", () => console.log("✅ WhatsApp bot is ready!"));

// Store and retrieve chat history
async function storeMessage(user, role, text) {
  try {
    let conversation = await Conversation.findOne({ user });
    if (!conversation) conversation = new Conversation({ user, messages: [] });
    conversation.messages.push({ role, text });
    if (conversation.messages.length > 20) conversation.messages.shift();
    await conversation.save();
  } catch (error) {
    console.error("❌ Error storing message:", error.message);
  }
}

async function getChatHistory(user) {
  try {
    const conversation = await Conversation.findOne({ user });
    return conversation
      ? conversation.messages.map((msg) => msg.text).join("\n")
      : "";
  } catch (error) {
    console.error("❌ Error retrieving chat history:", error.message);
    return "";
  }
}

async function sendTypingResponse(user, response) {
  const lines = response.split("\n");
  for (const line of lines) {
    await client.sendMessage(user, line);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

client.on("message", async (message) => {
  if (message.from.includes("@g.us")) return;

  const user = message.from;
  const text = message.body.trim().toLowerCase();
  await storeMessage(user, "user", text);
  const pastChat = await getChatHistory(user);

  const today = new Date();
  const formattedDate = `${today.getDate()}-${
    today.getMonth() + 1
  }-${today.getFullYear()}`;
  const festivals = {
    "01-01": "🎉 New Year's Day",
    "08-15": "🇮🇳 Independence Day (India)",
    "12-25": "🎄 Christmas Day",
    "10-31": "🎃 Halloween",
    "11-04": "🪔 Diwali",
  };
  const festivalToday =
    festivals[`${today.getMonth() + 1}-${today.getDate()}`] ||
    "No major festival today.";

  if (text.includes("date") || text.includes("today")) {
    await message.reply(`📅 Today's Date: ${formattedDate}`);
    return;
  }

  if (text.includes("time")) {
    await message.reply(`⏰ Current Time: ${today.toLocaleTimeString()}`);
    return;
  }

  if (text.includes("month")) {
    await message.reply(
      `📆 Current Month: ${today.toLocaleString("default", { month: "long" })}`
    );
    return;
  }

  if (text.includes("festival")) {
    await message.reply(`🎊 ${festivalToday}`);
    return;
  }

  if (text.includes("who are you") || text.includes("what is your name")) {
    await message.reply(
      "🤖 *I am your WhatsApp Assistant!* How can I help you today?"
    );
    return;
  }

  if (text.startsWith("/joke")) {
    try {
      const joke = await getJoke();
      await message.reply(`🤣 *Here's a joke for you:*\n\n🟢 ${joke}`);
    } catch (error) {
      console.error("❌ Error fetching joke:", error.message);
      await message.reply("❌ Unable to fetch a joke. Please try again later.");
    }
    return;
  }

  if (
    text.startsWith("image") ||
    text.startsWith("show me an image") ||
    text.startsWith("generate an image")
  ) {
    const prompt = text
      .replace(/^(image|show me an image|generate an image)/i, "")
      .trim();
    if (!prompt) {
      await message.reply(
        "❌ Please provide a valid image description!\nExample: *image a cyberpunk city at night*"
      );
      return;
    }
    await message.reply("⏳ Generating your image, please wait...");
    try {
      const imageUrl = await generateImage(prompt);
      if (imageUrl) {
        const media = await MessageMedia.fromUrl(imageUrl, {
          unsafeMime: true,
        });
        await client.sendMessage(user, media, {
          caption: `🖼️ *Generated Image:*\n${prompt}`,
        });
      } else {
        await message.reply("❌ Failed to generate image. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error generating image:", error.message);
      await message.reply("❌ Failed to send the generated image.");
    }
    return;
  }

  let response;
  try {
    response = await chatWithGemini(
      `Previous chat:\n${pastChat}\nNew message: ${text}`
    );
  } catch (error) {
    console.error("❌ AI Response Error:", error.message);
    response = "⚠️ Sorry, I couldn't understand that. Please try again!";
  }

  const safeResponse = response.replace(
    /Google Gemini|Gemini AI|language model|Google AI/gi,
    ""
  );
  await sendTypingResponse(user, safeResponse);
});

async function startBot() {
  try {
    await connectDB();

    const session = await getSession();
    if (session) {
      console.log("🔄 Restoring session...");
      client.options.session = session;
    }

    client.initialize();
  } catch (error) {
    console.error("❌ Failed to start bot:", error);
  }
}

startBot();

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
