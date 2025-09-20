const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI('AIzaSyDkHhujvXjQW243snouTtpCISdM97zH4mU');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'CopyCache Server is running!', 
    endpoints: {
      '/': 'Server status',
      '/chat': 'POST - Chat with Gemini AI'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.post('/chat', async (req, res) => {
  const { message, copies } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const copiesText = copies && copies.length > 0
      ? `The user has these copied items: ${copies.join(', ')}. `
      : 'The user has no copied items. ';

    const prompt = `You are a specialized assistant that ONLY answers questions about the user's copied text content. You MUST NOT answer general questions, provide information about topics not in the copied content, or engage in conversation about anything else.

${copiesText}

IMPORTANT RULES:
- Only answer questions that are directly related to the copied content above
- If the question is not about the copied content, respond with: "I can only help with questions about your copied text content."
- Do not provide general knowledge or information about topics not mentioned in the copied items
- Be concise and directly address the content in the copied items
- If no copied items exist, inform the user they need to copy some text first

User question: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate response', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});