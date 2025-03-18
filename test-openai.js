import OpenAI from "openai";
import dotenv from "dotenv"; // Use ES module import
dotenv.config(); // Load environment variables

const openai = new OpenAI({
  apiKey: process.env.HF_API_KEY,
  baseURL: "https://api-inference.huggingface.co/v1", // Point to Hugging Face
});

async function testHuggingFace() {
  try {
    const response = await openai.chat.completions.create({
      messages: [{ role: "user", content: "Hello, who are you?" }],
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      max_tokens: 50,
    });
    console.log("✅ Test response:", response.choices[0].message.content);
  } catch (error) {
    console.error("❌ Hugging Face API error:", error);
  }
}

testHuggingFace();