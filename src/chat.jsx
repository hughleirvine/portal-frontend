import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import FileList from './FileList.jsx';

function Chat({ token, onLogout }) {
  const { lang } = useParams();
  const [selectedFile, setSelectedFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [messages, setMessages] = useState([]);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(0);
  const chatHistoryRef = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/chat/history`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const history = await response.json();
          const formattedHistory = history.flatMap(item => [
            { sender: 'user', text: item.question },
            { sender: 'bot', text: item.answer },
          ]);
          setMessages(formattedHistory);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
      setIsLoading(false);
    };
    fetchHistory();
  }, [token]);

  useEffect(() => {
    if (chatHistoryRef.current) {
        chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadStatus('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Please select a file first.');
      return;
    }
    setIsLoading(true);
    setUploadStatus('Uploading and indexing...');
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (response.ok) {
        setUploadStatus(`File '${selectedFile.name}' uploaded successfully!`);
        setFileUploaded(count => count + 1);
      } else {
        const errorData = await response.json();
        setUploadStatus(`Upload failed: ${errorData.detail}`);
      }
    } catch (error) {
      setUploadStatus('An error occurred during upload.');
    }
    setIsLoading(false);
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    const userMessage = { sender: 'user', text: question };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setQuestion('');
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question: question, language: lang }),
      });
      let botMessage;
      if (response.ok) {
        const data = await response.json();
        botMessage = { sender: 'bot', text: data.answer };
      } else {
        const errorData = await response.json();
        botMessage = { sender: 'bot', text: `Error: ${errorData.detail}` };
      }
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      const errorMessage = { sender: 'bot', text: 'An error occurred while asking the question.' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    }
    setIsLoading(false);
  };

  const handleGetWebhook = async () => {
    setWebhookLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/webhooks/me`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setWebhookUrl(data.webhook_url);
      } else {
        setWebhookUrl('Could not fetch webhook URL.');
      }
    } catch (error) {
      setWebhookUrl('An error occurred.');
    }
    setWebhookLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    alert('Webhook URL copied to clipboard!');
  };

  const handleFileDeleted = () => {
    setFileUploaded(count => count + 1);
    setMessages([]);
    alert('File deleted. The chat history has been cleared.');
  };

  return (
    <>
      <header className="App-header">
        <h1>Document Chat Portal</h1>
        <button onClick={onLogout} className="logout-button">Logout</button>
      </header>
      <main className="App-main">
        <FileList token={token} fileUploaded={fileUploaded} onFileDeleted={handleFileDeleted} />
        <div className="upload-section">
          <h2>Upload a New Document</h2>
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleUpload} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Upload'}
          </button>
          {uploadStatus && <p className="status-message">{uploadStatus}</p>}
        </div>
        <div className="chat-section">
          <h2>Ask a Question</h2>
          <div className="chat-history" ref={chatHistoryRef}>
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}-message`}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            ))}
            {isLoading && messages.length > 0 && <div className="message bot-message">Thinking...</div>}
          </div>
          <div className="chat-input-area">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about your documents..."
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleAskQuestion()}
            />
            <button onClick={handleAskQuestion} disabled={isLoading}>
              Ask
            </button>
          </div>
        </div>
        <div className="webhook-section">
          <h2>Your Public Webhook</h2>
          <p>Generate a public URL to allow anyone to chat with your documents.</p>
          <button onClick={handleGetWebhook} disabled={webhookLoading}>
            {webhookLoading ? 'Generating...' : 'Get My Webhook URL'}
          </button>
          {webhookUrl && (
            <div className="webhook-display">
              <p>Your public URL is:</p>
              <input type="text" readOnly value={webhookUrl} />
              <button onClick={copyToClipboard}>Copy</button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default Chat;