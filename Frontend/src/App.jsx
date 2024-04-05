import './App.css';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleDiv } from './redux/reducers';
import GameComponent from './Components/Game.component';

const App = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const showDiv = useSelector((state) => state.GameComponent.showDiv);
  const dispatch = useDispatch();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
      dispatch(toggleDiv()); 
    }
  }, [dispatch]);

  const handleSubmit = async () => {
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      localStorage.setItem('username', username);
      dispatch(toggleDiv()); 
    } catch (error) {
      console.error('Error:', error.message);
      setError('Failed to register user');
    }
  };

  return (
    <>
      <div className="h-screen flex items-center justify-center">
        {showDiv ? (
          <GameComponent username={username} />
        ) : (
          <div className="grid">
            <label className="input input-bordered flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="w-4 h-4 opacity-70"
              >
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
              </svg>
              <input
                type="text"
                className="grow"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <button
              type="button"
              className="animate-pulse duration-1000 text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-2"
              onClick={handleSubmit}
            >
              Click to Play
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default App;