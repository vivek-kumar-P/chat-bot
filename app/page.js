"use client";
import { Box, Stack, TextField, Button, IconButton, Typography, InputAdornment, Avatar, Chip, ThemeProvider, createTheme } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import { styled } from "@mui/system";
import { motion } from "framer-motion";

// Custom styled components
const ChatContainer = styled(Box)(({ theme }) => ({
  width: "100vw",
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  background: theme.palette.mode === "dark"
    ? "linear-gradient(135deg, #1C2526 0%, #2E3B3E 100%)"
    : "linear-gradient(135deg, #2E3B3E 0%, #4A5E61 100%)",
  position: "relative",
  overflow: "hidden",
  [theme.breakpoints.down("sm")]: {
    height: "auto",
    minHeight: "100vh",
    padding: "16px",
  },
}));

const AnimatedBackground = styled("div")({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  overflow: "hidden",
  zIndex: 1,
  background: "linear-gradient(45deg, #2E3B3E, #4A5E61, #2E3B3E, #4A5E61)",
  backgroundSize: "400%",
  animation: "gradientShift 20s ease infinite",
  "@keyframes gradientShift": {
    "0%": { backgroundPosition: "0% 50%" },
    "50%": { backgroundPosition: "100% 50%" },
    "100%": { backgroundPosition: "0% 50%" },
  },
});

const Wave = styled("div")({
  position: "absolute",
  bottom: 0,
  left: 0,
  width: "100%",
  height: "20%",
  background: "linear-gradient(90deg, rgba(74, 94, 97, 0.3), rgba(28, 37, 38, 0.3))",
  clipPath: "polygon(0 70%, 10% 50%, 20% 80%, 30% 40%, 40% 70%, 50% 30%, 60% 60%, 70% 20%, 80% 50%, 90% 10%, 100% 40%, 100% 100%, 0 100%)",
  animation: "wave 10s ease-in-out infinite",
  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(90deg, rgba(74, 94, 97, 0.2), rgba(28, 37, 38, 0.2))",
    clipPath: "polygon(0 70%, 10% 50%, 20% 80%, 30% 40%, 40% 70%, 50% 30%, 60% 60%, 70% 20%, 80% 50%, 90% 10%, 100% 40%, 100% 100%, 0 100%)",
    animation: "wave2 12s ease-in-out infinite",
  },
  "@keyframes wave": {
    "0%": { transform: "translateX(0)" },
    "50%": { transform: "translateX(-50px)" },
    "100%": { transform: "translateX(0)" },
  },
  "@keyframes wave2": {
    "0%": { transform: "translateX(-20px)" },
    "50%": { transform: "translateX(20px)" },
    "100%": { transform: "translateX(-20px)" },
  },
});

const GlowingOrb = styled("div")(({ color }) => ({
  position: "absolute",
  width: "100px",
  height: "100px",
  background: `radial-gradient(circle at 30% 30%, ${color}, transparent 70%)`,
  borderRadius: "50%",
  boxShadow: `0 0 20px ${color}, inset 0 0 10px rgba(255, 255, 255, 0.3)`,
  opacity: 0.6,
  animation: "float 8s ease-in-out infinite",
  "@keyframes float": {
    "0%": { transform: "translateY(0) rotate(0deg)", opacity: 0.6 },
    "50%": { transform: "translateY(-20px) rotate(10deg)", opacity: 0.9 },
    "100%": { transform: "translateY(0) rotate(0deg)", opacity: 0.6 },
  },
}));

const ChatBox = styled(Stack)(({ theme }) => ({
  width: "800px",
  maxWidth: "90%",
  height: "600px",
  background: theme.palette.mode === "dark"
    ? "rgba(28, 37, 38, 0.9)"
    : "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  borderRadius: "16px",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)", // Reduced shadow
  padding: "24px",
  spacing: "16px",
  position: "relative",
  zIndex: 2,
  [theme.breakpoints.down("md")]: {
    width: "80%",
    height: "auto",
    minHeight: "80vh",
  },
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    padding: "16px",
  },
}));

const ChatBubble = styled(motion.div)(({ role, theme }) => ({
  background: role === "assistant"
    ? theme.palette.mode === "dark"
      ? "linear-gradient(135deg, #2E3B3E 0%, #5D737E 50%)" // Updated gradient for assistant
      : "linear-gradient(135deg, #2E3B3E 0%, #5D737E 100%)"
    : theme.palette.mode === "dark"
      ? "linear-gradient(135deg, #FF7043 0%, #FFAB91 50%)"
      : "linear-gradient(135deg, #FF7043 0%, #FFAB91 100%)",
  color: theme.palette.text.primary,
  borderRadius: "12px",
  padding: "12px 16px",
  maxWidth: "80%",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  fontFamily: "'Inter', sans-serif",
  fontSize: "16px",
  lineHeight: "1.5",
  marginBottom: "8px",
  "@media (max-width: 600px)": {
    fontSize: "14px",
    padding: "8px 12px",
  },
}));

const SendButton = styled(Button)(({ theme }) => ({
  position: "relative",
  background: "transparent",
  color: theme.palette.text.primary,
  "&:hover": {
    background: "rgba(0, 0, 0, 0.1)",
    transform: "scale(1.1)",
    transition: "transform 0.2s ease",
  },
  "&:active": {
    "&:before": {
      content: '""',
      position: "absolute",
      top: "50%",
      left: "50%",
      width: "0",
      height: "0",
      background: "rgba(255, 255, 255, 0.3)",
      borderRadius: "50%",
      animation: "ripple 0.6s ease-out",
    },
  },
  minWidth: "auto",
  padding: "4px",
  "@keyframes ripple": {
    "0%": { width: "0", height: "0", opacity: 1, transform: "translate(-50%, -50%)" },
    "100%": { width: "50px", height: "50px", opacity: 0, transform: "translate(-50%, -50%)" },
  },
}));

const TypingIndicator = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: "8px",
  "& .dot": {
    width: "8px",
    height: "8px",
    background: theme.palette.text.primary,
    borderRadius: "50%",
    margin: "0 4px",
    animation: "blink 1.4s infinite both",
  },
  "& .dot:nth-of-type(2)": {
    animationDelay: "0.2s",
  },
  "& .dot:nth-of-type(3)": {
    animationDelay: "0.4s",
  },
  "@keyframes blink": {
    "0%": { opacity: 0.2 },
    "20%": { opacity: 1 },
    "100%": { opacity: 0.2 },
  },
}));

const QuickReplyContainer = styled(Stack)({
  display: "flex",
  flexDirection: "row",
  gap: "8px", // Reduced gap for better fit on mobile
  marginBottom: "8px",
  overflowX: "auto",
  padding: "4px 0",
  flexWrap: "nowrap", // Ensure single line
  "&::-webkit-scrollbar": {
    height: "6px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: "3px",
  },
});

const QuickReplyChip = styled(Chip)(({ theme }) => ({
  background: theme.palette.mode === "dark"
    ? "linear-gradient(90deg, #4A5E61 0%, #6B7F82 100%)"
    : "linear-gradient(90deg, #4A5E61 0%, #6B7F82 100%)",
  color: theme.palette.text.primary,
  fontWeight: 500,
  borderRadius: "8px", // Slightly rounded corners
  padding: "6px 12px",
  border: "1px solid rgba(74, 94, 97, 0.3)", // Subtle border matching background
  boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.2)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 0 15px rgba(107, 127, 130, 0.5)",
    background: "linear-gradient(90deg, #6B7F82 0%, #4A5E61 100%)",
    cursor: "pointer",
  },
  "@media (max-width: 600px)": {
    padding: "4px 8px",
    fontSize: "12px",
  },
}));

// Function to clean the API response
const cleanResponse = (text) => {
  return text.replace(/phantom style="[^"]*"/g, "").trim();
};

// Function to format the reply
const formatReply = (text) => {
  const lines = text.split("\n").filter((line) => line.trim());
  let formatted = [];
  let inList = false;
  let listItems = [];

  lines.forEach((line, index) => {
    if (line.includes(":")) {
      const [heading, content] = line.split(":", 2);
      if (content && !line.startsWith("-") && !line.startsWith("*")) {
        formatted.push(
          <div key={`heading-${index}`}>
            <strong style={{ fontWeight: 700 }}>{heading.trim()}:</strong> {content.trim()}
          </div>
        );
        return;
      }
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      inList = true;
      listItems.push(line.replace(/^[-*]\s*/, ""));
    } else {
      if (inList) {
        formatted.push(
          <ul key={`list-${index}`} style={{ paddingLeft: "20px", margin: "4px 0" }}>
            {listItems.map((item, i) => (
              <li key={`item-${i}`} style={{ marginBottom: "2px", fontWeight: 500 }}>{item}</li>
            ))}
          </ul>
        );
        inList = false;
        listItems = [];
      }
      formatted.push(<p key={`para-${index}`} style={{ margin: "4px 0" }}>{line}</p>);
    }
  });

  if (inList) {
    formatted.push(
      <ul key={`list-end`} style={{ paddingLeft: "20px", margin: "4px 0" }}>
        {listItems.map((item, i) => (
          <li key={`item-${i}`} style={{ marginBottom: "2px", fontWeight: 500 }}>{item}</li>
        ))}
      </ul>
    );
  }

  return formatted;
};

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSentInitialMessage, setHasSentInitialMessage] = useState(false);
  const [hasUserStartedConversation, setHasUserStartedConversation] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [suggestedReplies, setSuggestedReplies] = useState([
    "Hello",
    "Help",
    "Features",
    "Support",
    "Info",
    "Chat",
  ]);
  const messagesEndRef = useRef(null);

  // Theme setup for light/dark mode
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? "dark" : "light",
      background: {
        default: isDarkMode ? "#1C2526" : "#2E3B3E",
        paper: isDarkMode ? "rgba(28, 37, 38, 0.9)" : "rgba(255, 255, 255, 0.1)",
      },
      text: {
        primary: isDarkMode ? "#E0E0E0" : "#1C2526",
        secondary: isDarkMode ? "#B0BEC5" : "#B0BEC5",
      },
    },
  });

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    if (messages.length === 0 && !isLoading && !hasSentInitialMessage) {
      sendInitialMessage();
    }
  }, [messages, isLoading, hasSentInitialMessage]);

  const sendInitialMessage = async () => {
    setIsLoading(true);
    setHasSentInitialMessage(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      const processStream = async ({ done, value }) => {
        if (done) {
          const cleanedContent = cleanResponse(assistantContent);
          setMessages([
            { role: "assistant", content: "Hi! How can I help you today?", timestamp: new Date().toLocaleTimeString() },
          ]);
          setIsLoading(false);
          return;
        }

        const text = decoder.decode(value, { stream: true });
        assistantContent += text;

        return reader.read().then(processStream);
      };

      reader.read().then(processStream);
    } catch (error) {
      console.error("❌ Error sending initial message:", error);
      setMessages([
        { role: "assistant", content: "Hi! An error occurred. Please try again later.", timestamp: new Date().toLocaleTimeString() },
      ]);
      setIsLoading(false);
    }
  };

  const updateSuggestedReplies = (message) => {
    if (message.toLowerCase().includes("features")) {
      setSuggestedReplies(["More Features", "Pricing", "Compare Plans"]);
    } else if (message.toLowerCase().includes("help")) {
      setSuggestedReplies(["Technical Support", "FAQs", "Contact Us"]);
    } else {
      setSuggestedReplies(["Hello", "Help", "Features", "Support", "Info", "Chat"]);
    }
  };

  const sendMessage = async (text = message) => {
    if (!text.trim()) return;

    const userMessage = { role: "user", content: text, timestamp: new Date().toLocaleTimeString() };
    setMessages((prevMessages) => [
      ...prevMessages,
      userMessage,
      { role: "assistant", content: "", timestamp: new Date().toLocaleTimeString() },
    ]);
    setMessage("");
    setIsLoading(true);

    if (!hasUserStartedConversation) {
      setHasUserStartedConversation(true);
    }

    updateSuggestedReplies(text);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [userMessage] }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      const processStream = async ({ done, value }) => {
        if (done) {
          const cleanedContent = cleanResponse(assistantContent);
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage.role === "assistant" && lastMessage.content === "") {
              updatedMessages[updatedMessages.length - 1] = {
                role: "assistant",
                content: cleanedContent || "Sorry, an error occurred. Please try again.",
                timestamp: new Date().toLocaleTimeString(),
              };
              if (updatedMessages.length > 1) {
                const secondLastMessage = updatedMessages[updatedMessages.length - 2];
                if (secondLastMessage.role === "assistant" && secondLastMessage.content === cleanedContent) {
                  updatedMessages.pop();
                }
              }
            }
            return updatedMessages;
          });
          setIsLoading(false);
          return;
        }

        const text = decoder.decode(value, { stream: true });
        assistantContent += text;

        return reader.read().then(processStream);
      };

      reader.read().then(processStream);
    } catch (error) {
      console.error("❌ Error sending message:", error);
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        { role: "assistant", content: "Sorry, an error occurred. Please try again later.", timestamp: new Date().toLocaleTimeString() },
      ]);
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setIsLoading(false);
    setHasSentInitialMessage(false);
    setHasUserStartedConversation(false);
    setSuggestedReplies(["Hello", "Help", "Features", "Support", "Info", "Chat"]);
  };

  const handleQuickReply = (reply) => {
    sendMessage(reply);
    setHasUserStartedConversation(true);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const startListening = () => {
    if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      alert("Sorry, your browser does not support speech recognition.");
      return;
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
      setIsListening(false);
    };
    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      alert("An error occurred during speech recognition. Please try again.");
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <ThemeProvider theme={theme}>
      <ChatContainer>
        <AnimatedBackground>
          <Wave />
          <GlowingOrb color="rgba(74, 94, 97, 0.5)" style={{ top: "10%", left: "10%", animationDelay: "0s" }} />
          <GlowingOrb color="rgba(255, 112, 67, 0.5)" style={{ bottom: "15%", right: "15%", animationDelay: "3s" }} />
        </AnimatedBackground>
        <ChatBox>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: theme.palette.text.primary,
                fontFamily: "'Inter', sans-serif",
                "@media (max-width: 600px)": {
                  fontSize: "1.5rem",
                },
              }}
            >
              HeadstartAI Chat
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton onClick={toggleTheme} color="inherit" aria-label="Toggle theme">
                <Brightness4Icon />
              </IconButton>
              <IconButton color="error" onClick={clearChat} disabled={isLoading} aria-label="Clear chat">
                <DeleteIcon />
              </IconButton>
            </Stack>
          </Stack>
          <Stack
            direction="column"
            spacing={1}
            flexGrow={1}
            overflow="auto"
            maxHeight="100%"
            sx={{ position: "relative", paddingRight: "8px" }}
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                alignItems="center"
                justifyContent={
                  message.role === "assistant" ? "flex-start" : "flex-end"
                }
              >
                {message.role === "user" && (
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      mr: 1,
                      background: "linear-gradient(135deg, #FF7043 0%, #FFAB91 100%)",
                    }}
                    alt="User"
                  />
                )}
                <ChatBubble
                  role={message.role}
                  theme={theme}
                  initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  sx={{
                    "&:hover": {
                      transform: "translateY(-2px)",
                      transition: "transform 0.2s ease",
                    },
                  }}
                >
                  <div>{formatReply(message.content)}</div>
                  <div style={{ fontSize: "0.7em", textAlign: "right", color: theme.palette.text.secondary, marginTop: "4px" }}>
                    {message.timestamp}
                  </div>
                </ChatBubble>
              </Box>
            ))}
            {isLoading && (
              <Box display="flex" alignItems="center">
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    mr: 1,
                    background: "linear-gradient(135deg, #2E3B3E 0%, #5D737E 100%)", // Match assistant bubble color
                  }}
                  alt="Assistant"
                />
                <TypingIndicator theme={theme}>
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </TypingIndicator>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Stack>
          {messages.length >= 1 && messages[0].role === "assistant" && !hasUserStartedConversation && (
            <QuickReplyContainer>
              {suggestedReplies.map((reply, index) => (
                <QuickReplyChip
                  key={index}
                  label={reply}
                  onClick={() => handleQuickReply(reply)}
                />
              ))}
            </QuickReplyContainer>
          )}
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            disabled={isLoading}
            sx={{
              "& .MuiInputBase-root": {
                fontFamily: "'Inter', sans-serif",
                background: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "white",
                borderRadius: "8px",
                fontSize: "16px",
                color: theme.palette.text.primary,
                "@media (max-width: 600px)": {
                  fontSize: "14px",
                },
              },
              "& .MuiInputLabel-root": {
                fontFamily: "'Inter', sans-serif",
                color: theme.palette.text.primary,
                "@media (max-width: 600px)": {
                  fontSize: "14px",
                },
              },
              background: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.8)",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              marginTop: "8px",
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={startListening} disabled={isLoading} aria-label="Voice input">
                    <MicIcon color={isListening ? "primary" : "inherit"} />
                  </IconButton>
                  <SendButton theme={theme} onClick={() => sendMessage()} disabled={isLoading} aria-label="Send message">
                    <SendIcon fontSize="small" />
                  </SendButton>
                </InputAdornment>
              ),
            }}
          />
        </ChatBox>
      </ChatContainer>
    </ThemeProvider>
  );
}