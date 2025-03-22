import { OpenAI } from "openai";

export async function POST(req) {
  console.log("📩 Received request");

  if (!process.env.HF_API_KEY) {
    console.error("❌ ERROR: Missing Hugging Face API Key");
    return new Response("Internal Server Error: Missing API Key. Please set HF_API_KEY in environment variables.", { status: 500 });
  }
  console.log("🔑 HF API Key loaded (first 10 chars):", process.env.HF_API_KEY.slice(0, 10) + "...");

  try {
    const requestBody = await req.json();
    console.log("📩 Full request body:", requestBody);

    if (!requestBody.messages || !Array.isArray(requestBody.messages)) {
      console.error("❌ ERROR: messages is not an array", requestBody);
      return new Response("Bad Request: Invalid messages format", { status: 400 });
    }

    const userMessages = requestBody.messages;
    console.log("📨 User messages received:", userMessages);

    const isFirstMessage = userMessages.length === 1 && userMessages[0].content.trim().toLowerCase() === "hello";
    const systemPrompt = isFirstMessage
      ? `You are a customer support assistant for HeadstartAI. Your first response must be exactly: "Welcome to HeadstartAI Customer Support! I'm here to help. How can I help you today?" and contain no other text.`
      : `You are a customer support assistant for HeadstartAI. Provide helpful and professional replies without repeating the greeting. Format your response concisely using short paragraphs or bullet points (using -). Use headings (e.g., "Steps:") where appropriate. Avoid unnecessary repetition and keep the response clear and to the point.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...reorderMessages(userMessages),
    ];
    console.log("📋 Reordered messages for API:", messages);

    const openai = new OpenAI({
      apiKey: process.env.HF_API_KEY,
      baseURL: "https://api-inference.huggingface.co/v1",
    });

    const MAX_RETRIES = 3;
    let attempts = 0;
    let response;

    while (attempts < MAX_RETRIES) {
      try {
        console.log("📡 Attempting API call with model:", "mistralai/Mixtral-8x7B-Instruct-v0.1");
        response = await openai.chat.completions.create({
          messages: messages,
          model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
          stream: true,
          max_tokens: 500,
        });
        console.log("✅ API call successful");
        break;
      } catch (error) {
        console.error("❌ API call failed:", error.message, "Status:", error.status, "Details:", error);
        if (error.status === 429 && attempts < MAX_RETRIES - 1) {
          console.log(`⏳ Rate limit hit, retrying (${attempts + 1}/${MAX_RETRIES})...`);
          await new Promise((resolve) => setTimeout(resolve, 2000 * (attempts + 1)));
          attempts++;
          continue;
        }
        throw error;
      }
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = "";
          for await (const chunk of response) {
            console.log("📝 Raw chunk:", chunk);
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              console.log("📝 Chunk content:", content);
              fullContent += content;
              controller.enqueue(encoder.encode(content));
            }
          }
          if (isFirstMessage && !fullContent.startsWith("Welcome to HeadstartAI Customer Support!")) {
            console.warn("⚠️ First response invalid, falling back to default");
            controller.enqueue(encoder.encode("Welcome to HeadstartAI Customer Support! I'm here to help. How can I help you today?"));
          }
          controller.close();
        } catch (err) {
          console.error("❌ ERROR streaming response:", err);
          controller.enqueue(encoder.encode("Sorry, an error occurred. Please try again later."));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });

  } catch (error) {
    console.error("❌ ERROR processing request:", error);
    return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}

function reorderMessages(messages) {
  if (!messages.length) return [];

  let reordered = [];
  let lastRole = "system";

  messages.forEach((msg, index) => {
    if (msg.role === "user" && lastRole !== "user") {
      reordered.push(msg);
      lastRole = "user";
    } else if (msg.role === "assistant" && lastRole === "user") {
      reordered.push(msg);
      lastRole = "assistant";
    } else {
      console.warn(`⚠️ Skipping invalid message at index ${index}: ${JSON.stringify(msg)}`);
    }
  });

  if (reordered.length && reordered[reordered.length - 1].role === "user") {
    reordered.push({ role: "assistant", content: "" });
  }

  return reordered;
}