import React, a{ useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './Login';
import Chat from './Chat';

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && storedToken !== 'null' && storedToken !== 'undefined') {
      setToken(storedToken);
    }
  }, []);

  const handleSetToken = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={
          !token ? <Login setToken={handleSetToken} /> : <Navigate to="/en" />
        } />
        <Route path="/:lang" element={
          token ? <Chat token={token} onLogout={handleLogout} /> : <Navigate to="/login" />
        } />
        <Route path="*" element={!token ? <Navigate to="/login" /> : <Navigate to="/en" />} />
      </Routes>
    </div>
  );
}

export default App;