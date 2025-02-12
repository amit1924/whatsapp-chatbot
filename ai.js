import { GoogleGenerativeAI } from "@google/generative-ai";

async function chatWithGemini(text) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(text);
    const response = result.response.text();

    return response || "I couldn't process that.";
  } catch (error) {
    console.error("❌ Gemini AI Error:", error.message);
    return "i am busy now i will write you later";
  }
}

export default chatWithGemini;
