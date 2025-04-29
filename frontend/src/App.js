import React, { useState, useEffect } from 'react';

function App() {
  const [gameStatus, setGameStatus] = useState('Welcome to PlaceNDigits Game');
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [guesses, setGuesses] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);

  // Start a new game
  const startGame = async () => {
    const response = await fetch('http://127.0.0.1:5000/start', {
      method: 'POST',
    });
    const data = await response.json();
    setGameStatus(data.message);
    setFeedback('');
    setGuess('');
    setGuesses(0);
    setTimeTaken(0);
  };

  // Handle user's guess
  const handleGuess = async () => {
    if (guess.length !== 4 || new Set(guess).size !== 4 || isNaN(guess)) {
      setFeedback('Invalid guess! Enter a 4-digit number with unique digits.');
      return;
    }

    const response = await fetch('http://127.0.0.1:5000/guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guess }),
    });
    const data = await response.json();
    
    setFeedback(data.message);
    setGuesses(data.guesses);
    setTimeTaken(data.time || 0);

    if (data.correct_place === 4) {
      setGameStatus('Congratulations, you guessed the correct number!');
    }
  };

  return (
    <div>
      <h1>{gameStatus}</h1>
      <button onClick={startGame}>Start Game</button>
      <div>
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          maxLength="4"
        />
        <button onClick={handleGuess}>Guess</button>
      </div>
      <div>
        <p>{feedback}</p>
        <p>Guesses: {guesses}</p>
        <p>Time Taken: {timeTaken.toFixed(2)} seconds</p>
      </div>
    </div>
  );
}

export default App;
