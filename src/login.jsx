import React, { useState } from 'react';

function Login({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const endpoint = isRegistering ? '/register' : '/token';
    const url = `${API_BASE_URL}${endpoint}`;
    try {
      let response;
      if (isRegistering) {
        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
      } else {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData,
        });
      }
      const data = await response.json();
      if (response.ok) {
        setToken(data.access_token);
      } else {
        setError(data.detail || 'An error occurred.');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>{isRegistering ? 'Register New Account' : 'Login'}</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="submit-button">{isRegistering ? 'Register' : 'Login'}</button>
        <p className="toggle-form">
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}
          <button type="button" onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? 'Login' : 'Register'}
          </button>
        </p>
      </form>
    </div>
  );
}

export default Login;