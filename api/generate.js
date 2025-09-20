const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const upload = multer({ dest: 'uploads/' });

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY is missing!");
}

app.post('/api/generate', upload.single('file'), async (req, res) => {
  console.log('Received request:', req.body, req.file);
  const { idea, type } = req.body;
  const file = req.file;

  if (!idea || !type) {
    return res.status(400).json({ error: 'Idea and type are required.' });
  }

  let prompt = "";
  if (type === "story") {
    prompt = `Write a creative story prompt for the idea: "${idea}". Include genre, characters, and setting.`;
  } else if (type === "art") {
    prompt = `Write an AI art prompt for: "${idea}". Include scene description, style, lighting, and mood.`;
  } else if (type === "code") {
    prompt = `Write a coding challenge for: "${idea}". Include problem description, input/output format, and constraints.`;
  } else {
    prompt = `Create a useful prompt for: "${idea}".`;
  }

  if (file) {
    prompt += ` The user also uploaded a file named "${file.originalname}".`;
  }

  console.log('Generated prompt:', prompt);

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "You are a creative assistant that generates prompts based on user ideas." },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 500
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const generatedPrompt = response.data.choices[0].message.content;
    console.log('API response:', generatedPrompt);
    res.json({ prompt: generatedPrompt });
  } catch (error) {
    console.error('Groq API Error:', error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate prompt using Groq API." });
  }
});

module.exports = app;

// Add this block for local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`✅ Backend running at http://localhost:${PORT}`);
  });
}