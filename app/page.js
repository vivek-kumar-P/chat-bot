"use client";
import { Box, Stack, TextField, Button, CircularProgress, IconButton } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import DeleteIcon from "@mui/icons-material/Delete";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    // Send initial message to trigger greeting only if no messages exist
    if (messages.length === 0 && !isLoading) {
      sendInitialMessage();
    }
  }, [messages, isLoading]);

  const sendInitialMessage = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] }),
      });

      if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      const processStream = async ({ done, value }) => {
        if (done) {
          // Only set the message if it starts with the expected greeting or is valid
          if (assistantContent.trim() && assistantContent.startsWith("Welcome to HeadstartAI Customer Support!")) {
            setMessages([{ role: "assistant", content: assistantContent, timestamp: new Date().toLocaleTimeString() }]);
          } else {
            setMessages([{ role: "assistant", content: "Welcome to HeadstartAI Customer Support! I'm here to help. How can I help you today?", timestamp: new Date().toLocaleTimeString() }]);
          }
          setIsLoading(false);
          return;
        }

        const text = decoder.decode(value, { stream: true });
        assistantContent += text;

        // Update state during streaming but only if valid
        if (assistantContent.trim() && assistantContent.startsWith("Welcome to HeadstartAI Customer Support!")) {
          setMessages([{ role: "assistant", content: assistantContent, timestamp: new Date().toLocaleTimeString() }]);
        }

        return reader.read().then(processStream);
      };

      reader.read().then(processStream);
    } catch (error) {
      console.error("❌ Error sending initial message:", error);
      setMessages([{ role: "assistant", content: "Welcome to HeadstartAI Customer Support! I'm here to help. How can I help you today?", timestamp: new Date().toLocaleTimeString() }]);
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { role: "user", content: message, timestamp: new Date().toLocaleTimeString() };
    setMessages((prevMessages) => [
      ...prevMessages,
      userMessage,
      { role: "assistant", content: "", timestamp: new Date().toLocaleTimeString() },
    ]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [userMessage] }),
      });

      if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      const processStream = async ({ done, value }) => {
        if (done) {
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            updatedMessages[updatedMessages.length - 1] = {
              role: "assistant",
              content: assistantContent,
              timestamp: new Date().toLocaleTimeString(),
            };
            return updatedMessages;
          });
          setIsLoading(false);
          return;
        }

        const text = decoder.decode(value, { stream: true });
        assistantContent += text;

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages[updatedMessages.length - 1] = {
            role: "assistant",
            content: assistantContent,
            timestamp: new Date().toLocaleTimeString(),
          };
          return updatedMessages;
        });

        return reader.read().then(processStream);
      };

      reader.read().then(processStream);
    } catch (error) {
      console.error("❌ Error sending message:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: "Sorry, an error occurred.", timestamp: new Date().toLocaleTimeString() },
      ]);
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setIsLoading(false);
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction="column"
        width="600px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={3}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <h2>HeadstartAI Chat</h2>
          <IconButton color="error" onClick={clearChat} disabled={isLoading}>
            <DeleteIcon />
          </IconButton>
        </Stack>
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
          sx={{ position: "relative" }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
            >
              <Box
                bgcolor={
                  message.role === "assistant" ? "primary.main" : "secondary.main"
                }
                color="white"
                borderRadius={12}
                p={2}
                sx={{ maxWidth: "70%" }}
              >
                <div>{message.content}</div>
                <div style={{ fontSize: "0.7em", textAlign: "right", color: "#ccc" }}>
                  {message.timestamp}
                </div>
              </Box>
            </Box>
          ))}
          {isLoading && (
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <CircularProgress color="primary" />
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction="row" streaming={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            disabled={isLoading}
          />
          <Button variant="contained" onClick={sendMessage} disabled={isLoading}>
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}