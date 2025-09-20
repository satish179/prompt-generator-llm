import React, { useState } from 'react';
import PromptGenerator from './components/PromptGenerator';
import styles from './App.module.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? styles.dark : styles.light}>
      <div className={styles.chatContainer}>
        <h2 style={{ textAlign: 'center' }}>Prompt Builder Chatbot</h2>
         <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000
          }}>
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '🔆' : '🌙'}
          </button>
        </div>
        <PromptGenerator darkMode={darkMode} />
      </div>
    </div>
  );
}

export default App;
