import React, { useState, useEffect, useRef } from 'react';
import './App.css';


function App() {
  const [gameStatus, setGameStatus] = useState('Welcome to PlaceNDigits Game');
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [guesses, setGuesses] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [guessHistory, setGuessHistory] = useState([]);
  const [liveTime, setLiveTime] = useState(0);
  const timerRef = useRef(null); // ✅ Use this to track setInterval ID
  const [isGameActive, setIsGameActive] = useState(false);
  const [showPlayAgain, setShowPlayAgain] = useState(false);
  




// Start a new game
const startGame = async () => {
  // Stop any existing timer
  if (timerRef.current) {
    clearInterval(timerRef.current);
  }

  // Reset live timer and start a new one
  setLiveTime(0);
  timerRef.current = setInterval(() => {
    setLiveTime(prev => prev + 1);
  }, 1000);

  // Start a new game on the backend
  const response = await fetch('http://127.0.0.1:5000/start', {
    method: 'POST',
  });
  const data = await response.json();
  console.log(data);

  // Reset all game state
  setGameStatus(data.message);
  setFeedback('');
  setGuess('');
  setGuesses(0);
  setGuessHistory([]);  
  setTimeTaken(0);
  setIsGameActive(true);
};

  
  
  // Make a guess
  const makeGuess = async () => {
    const response = await fetch('http://127.0.0.1:5000/guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guess }),
    });
  
    const data = await response.json();
    setFeedback(data.result);
  
    if (data.result.includes("Correct")) {
      setTimeTaken(data.time);
      setGuesses(data.attempts);
    }
  };
  

  
  // Handle Guess 
  const handleGuess = async () => {
    if (guess.length !== 4 || new Set(guess).size !== 4 || isNaN(guess)) {
      setFeedback('Invalid guess! Enter a 4-digit number with unique digits.');
      return;
    }
  
    try {
      const response = await fetch('http://127.0.0.1:5000/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guess }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        const message =
          data.correct_place === 4
            ? `Congratulations! You guessed the correct number: ${guess}`
            : `${guess} - ${data.correct_place} Place ${data.correct_digit} Digit`;
  
        setFeedback(message);
        setGuesses(data.guesses);
        setTimeTaken(data.time || 0);
        setGuessHistory((prev) => [{guess, message}, ...prev]);

        if (data.correct_place === 4) {
          setGameStatus('Congratulations, you guessed the correct number!');
          clearInterval(timerRef.current);
          setShowPlayAgain(true);
        }
      } else {
        setFeedback(data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Guess request failed:', error);
      setFeedback('Server error. Try again later.');
    }
  
    setGuess(""); // clear input after guess
  };
  
  

  return (
    <div className='container'>
      <h1>{gameStatus}</h1>
      {!isGameActive && (
      <button onClick={startGame}>Start Game</button>
      )}

      {isGameActive && gameStatus.startsWith('Congratulations') && (
      <button onClick={startGame}>Play Again</button>
      )}

      <div className="input-section">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleGuess();
          }}
          maxLength="4"
        />
        <button onClick={handleGuess}>Guess</button>
      </div>
      <div className='feedback'>
        <p>Live Time: {liveTime} seconds</p>
        <p>{feedback}</p>
        <p>Guesses: {guesses}</p>
        <p>Time Taken: {timeTaken.toFixed(2)} seconds</p>
      </div>
      <div className='history'>
      <h2>Guess History</h2>
      <ul>
        {guessHistory.map((entry, index) => (
          <li key={index}>
            #{guessHistory.length - index}: {entry.message}
          </li>
        ))}
      </ul>
    </div>

    </div>
  );
}

export default App;
