import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../App.module.css';

function PromptGenerator({ darkMode }) {
  const [idea, setIdea] = useState('');
  const [type, setType] = useState('story');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Load chat history on mount
  useEffect(() => {
    const saved = localStorage.getItem('chat_history');
    if (saved) {
      setMessages(JSON.parse(saved));
    }
  }, []);

  // Save chat history whenever it changes
  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(messages));
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idea.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: idea }];
    setMessages(newMessages);
    setLoading(true);

    const formData = new FormData();
    formData.append('idea', idea);
    formData.append('type', type);
    if (file) formData.append('file', file);

    try {
      console.log('Sending request to http://localhost:5000/api/generate with:', { idea, type, fileName });
      const response = await axios.post('http://localhost:5000/api/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Response received:', response.data);

      let prompt = response.data.prompt;
      if (!prompt) {
        console.error('No prompt in response:', response.data);
        throw new Error('No prompt data received');
      }
      // Remove any unintended stars and format with bold subheadings
      prompt = prompt.replace(/\*/g, ''); // Remove all stars
      const formattedPrompt = prompt
        .replace(/Genre:/i, '<strong>Genre:</strong>')
        .replace(/Title:/i, '<strong>Title:</strong>')
        .replace(/Setting:/i, '<strong>Setting:</strong>')
        .replace(/Characters:/i, '<strong>Characters:</strong>')
        .replace(/Story:/i, '<strong>Story:</strong>')
        .replace(/Conflict:/i, '<strong>Conflict:</strong>');

      setMessages([...newMessages, { sender: 'bot', text: formattedPrompt }]);
      setIdea('');
      setFile(null);
      setFileName('');
    } catch (error) {
      console.error('Error generating prompt:', error.response ? error.response.data : error.message);
      setMessages([...newMessages, { sender: 'bot', text: '❌ Failed to generate prompt.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1500);
      })
      .catch(err => console.error('Failed to copy: ', err));
  };

  const handleFileChange = (e) => {
    const uploaded = e.target.files[0];
    if (uploaded) {
      setFile(uploaded);
      setFileName(uploaded.name);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([]);
      localStorage.removeItem('chat_history');
    }
  };

  return (
    <div className={styles.messages}>
      <button
        type="button"
        onClick={handleClearHistory}
        className={styles.clearButton}
        style={{ marginBottom: '10px' }}
      >
        Clear History
      </button>

      {messages.map((msg, index) => (
        <div
          key={index}
          className={`${styles.bubble} ${msg.sender === 'user' ? styles.user : styles.bot}`}
          style={{ position: 'relative' }}
        >
          <span
            dangerouslySetInnerHTML={{ __html: msg.text }}
          />
          {msg.sender === 'bot' && (
            <button
              onClick={() => handleCopy(msg.text, index)}
              className={copiedIndex === index ? styles.copiedButton : styles.copyButton}
            >
              {copiedIndex === index ? '✅ Copied!' : '📋 Copy'}
            </button>
          )}
        </div>
      ))}

      <form onSubmit={handleSubmit} className={styles.inputArea}>
        <input
          type="text"
          placeholder="Enter your idea..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
        />

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="story">Story Prompt</option>
          <option value="art">Art Prompt</option>
          <option value="code">Coding Challenge</option>
          <option value="custom">Custom Prompt</option>
        </select>

        <input
          type="file"
          onChange={handleFileChange}
        />

        {fileName && (
          <div className={styles.fileTag}>📎 {fileName}</div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Prompt'}
        </button>
      </form>
    </div>
  );
}

export default PromptGenerator;