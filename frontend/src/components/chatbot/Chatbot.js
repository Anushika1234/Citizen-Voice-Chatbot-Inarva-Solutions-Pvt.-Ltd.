import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [supportedLanguages, setSupportedLanguages] = useState({});
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ---------------- API FUNCTIONS ---------------- */

  const fetchSuggestedQuestions = async () => {
    try {
      const res = await axios.get('/api/chatbot/suggested');
      setSuggestedQuestions(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Suggested questions error:', error);
      setSuggestedQuestions([
        'How do I submit my life certificate?',
        'Why is my pension payment delayed?',
        'How do I update my bank details?',
        'How can I track my grievance status?'
      ]);
    }
  };

  const fetchSupportedLanguages = async () => {
    try {
      const res = await axios.get('/api/chatbot/languages');
      setSupportedLanguages(res.data || {});
    } catch (error) {
      console.error('Language fetch error:', error);
      setSupportedLanguages({
        en: 'English',
        hi: 'Hindi',
        mr: 'Marathi'
      });
    }
  };

  const fetchChatHistory = async () => {
    try {
      const res = await axios.get('/api/chatbot/history');
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.warn('No previous chat history');
    }
  };

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    fetchSuggestedQuestions();
    fetchSupportedLanguages();
    fetchChatHistory();
  }, [selectedLanguage]);

  /* ---------------- SEND MESSAGE ---------------- */
  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      sender: 'user',
      text
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/api/chatbot/chat', {
        query: text,
        language: selectedLanguage
      });

      const botMessage = {
        sender: 'bot',
        text: res.data?.response || 'No response received'
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Something went wrong. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        🤖 CitizenVoice Chatbot
      </Typography>

      {/* Language Selector */}
      <Button
        variant="outlined"
        sx={{ mb: 2 }}
        onClick={() => setLanguageDialogOpen(true)}
      >
        Language: {supportedLanguages[selectedLanguage] || 'English'}
      </Button>

      {/* Chat Window */}
      <Paper sx={{ height: 400, p: 2, overflowY: 'auto', mb: 2 }}>
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              textAlign: msg.sender === 'user' ? 'right' : 'left',
              mb: 1
            }}
          >
            <Typography
              sx={{
                display: 'inline-block',
                p: 1,
                borderRadius: 1,
                backgroundColor:
                  msg.sender === 'user' ? '#1976d2' : '#f1f1f1',
                color: msg.sender === 'user' ? '#fff' : '#000'
              }}
            >
              {msg.text}
            </Typography>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Paper>

      {/* Suggested Questions */}
      <Box sx={{ mb: 2 }}>
        {Array.isArray(suggestedQuestions) &&
          suggestedQuestions.map((q, i) => (
            <Button
              key={i}
              size="small"
              variant="outlined"
              sx={{ mr: 1, mb: 1 }}
              onClick={() => sendMessage(q)}
            >
              {q}
            </Button>
          ))}
      </Box>

      {/* Input */}
      <Box sx={{ display: 'flex' }}>
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
        />
        <IconButton
          color="primary"
          disabled={loading}
          onClick={() => sendMessage(input)}
        >
          <SendIcon />
        </IconButton>
      </Box>

      {/* Language Dialog */}
      <Dialog open={languageDialogOpen} onClose={() => setLanguageDialogOpen(false)}>
        <DialogTitle>Select Language</DialogTitle>
        <DialogContent>
          <Select
            fullWidth
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            {supportedLanguages &&
              Object.entries(supportedLanguages).map(([code, name]) => (
                <MenuItem key={code} value={code}>
                  {name}
                </MenuItem>
              ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLanguageDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Chatbot;