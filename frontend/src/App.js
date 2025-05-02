import React, { useState, useEffect } from 'react';
import './App.css';


function App() {
  const [gameStatus, setGameStatus] = useState('Welcome to PlaceNDigits Game');
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [guesses, setGuesses] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [guessHistory, setGuessHistory] = useState([]);
  const [liveTime, setLiveTime] = useState(0);
  const [timerId, setTimerId] = useState(null);



  // Start a new game
  const startGame = async () => {
    const response = await fetch('http://127.0.0.1:5000/start', {
      method: 'POST',
    });
    setLiveTime(0);  // Reset timer
    const intervalId = setInterval(() => {
      setLiveTime(prev => prev + 1);
    }, 1000);
    setTimerId(intervalId); // Save interval ID in state

    const data = await response.json();
    console.log(data);
    setGameStatus(data.message);
    setFeedback('');
    setGuess('');
    setGuesses(0);
    setTimeTaken(0);
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
          clearInterval(timerId);
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
