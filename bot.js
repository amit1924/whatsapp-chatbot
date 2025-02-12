// import "dotenv/config";
// import pkg from "whatsapp-web.js";
// const { Client, LocalAuth, MessageMedia } = pkg;

// import axios from "axios";
// import qrcode from "qrcode-terminal";
// import getJoke from "./joke.js";
// import chatWithGemini from "./ai.js";
// import generateImage from "./image.js";
// import { franc } from "franc-min";

// // Initialize WhatsApp Client
// const client = new Client({ authStrategy: new LocalAuth() });

// // QR Code Display
// client.on("qr", (qr) => {
//   qrcode.generate(qr, { small: true });
//   console.log("📲 Scan the above QR code with your WhatsApp.");
// });

// // When bot is ready
// client.on("ready", () => console.log("✅ WhatsApp bot is ready!"));

// // Function to Send Messages Line by Line
// async function sendTypingResponse(user, response) {
//   const lines = response.split("\n");

//   for (const line of lines) {
//     await client.sendMessage(user, line);
//     await new Promise((resolve) => setTimeout(resolve, 1000)); // 1-second delay
//   }
// }

// // Handle Incoming Messages
// client.on("message", async (message) => {
//   if (message.from.includes("@g.us")) return; // Ignore group messages

//   const user = message.from;
//   const text = message.body.trim();

//   // Detect Language
//   const language = franc(text);

//   // Handle "Who are you?"
//   if (
//     text.toLowerCase().includes("who are you") ||
//     text.toLowerCase().includes("what is your name")
//   ) {
//     await message.reply("🤖 *I am your friend Amit!*");
//     return;
//   }

//   // Handle Jokes
//   if (text.toLowerCase().startsWith("/joke")) {
//     const joke = await getJoke();
//     await message.reply(`🤣 *Here's a joke for you:*\n\n🟢 ${joke}`);
//     return;
//   }

//   const lowerText = text.toLowerCase().trim();
//   if (
//     lowerText.startsWith("image") ||
//     lowerText.startsWith("show me an image") ||
//     lowerText.startsWith("generate an image")
//   ) {
//     const prompt = lowerText
//       .replace("image", "")
//       .replace("show me an image", "")
//       .replace("generate an image", "")
//       .trim();

//     if (!prompt) {
//       await message.reply(
//         "❌ Please provide a prompt! Example: *image a futuristic city*"
//       );
//       return;
//     }

//     await message.reply("⏳ Generating your image, please wait...");

//     try {
//       const imageUrl = await generateImage(prompt);
//       if (imageUrl) {
//         const media = await MessageMedia.fromUrl(imageUrl, {
//           unsafeMime: true,
//         });
//         await client.sendMessage(user, media, {
//           caption: `🖼️ *Generated Image:*\n${prompt}`,
//         });
//       } else {
//         await message.reply("❌ Failed to generate image. Please try again.");
//       }
//     } catch (error) {
//       console.error("❌ Error sending image:", error.message);
//       await message.reply("❌ Failed to send the generated image.");
//     }
//     return;
//   }

//   // AI Chat Responses
//   const response = await chatWithGemini(text);
//   const safeResponse = response.replace(
//     /Google Gemini|Gemini AI|language model|bhasha model|Google AI/gi,
//     ""
//   );

//   await sendTypingResponse(user, safeResponse);
// });

// // Start the Bot
// client.initialize();
