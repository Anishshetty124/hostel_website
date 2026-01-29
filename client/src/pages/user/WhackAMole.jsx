import React, { useState, useEffect } from 'react';

const GRID_SIZE = 4;
const MOLE_APPEAR_INTERVAL = 800;
const GAME_DURATION = 20000; // 20 seconds

function getRandomCell() {
  return Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));
}

export default function WhackAMole() {
  const [moleIndex, setMoleIndex] = useState(getRandomCell());
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION / 1000);
  const [gameActive, setGameActive] = useState(true);

  useEffect(() => {
    if (!gameActive) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameActive(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameActive]);

  useEffect(() => {
    if (!gameActive) return;
    const moleTimer = setInterval(() => {
      setMoleIndex(getRandomCell());
    }, MOLE_APPEAR_INTERVAL);
    return () => clearInterval(moleTimer);
  }, [gameActive]);

  const handleWhack = idx => {
    if (!gameActive) return;
    if (idx === moleIndex) {
      setScore(s => s + 1);
      setMoleIndex(getRandomCell());
    }
  };

  const handleRestart = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION / 1000);
    setGameActive(true);
    setMoleIndex(getRandomCell());
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 text-2xl font-bold text-yellow-700 dark:text-yellow-300">Whack-a-Mole</div>
      <div className="mb-2">Score: <span className="font-bold">{score}</span></div>
      <div className="mb-2">Time Left: <span className="font-bold">{timeLeft}s</span></div>
      <div
        className="grid bg-gray-200 dark:bg-gray-800 rounded-lg mb-2"
        style={{ gridTemplateRows: `repeat(${GRID_SIZE}, 2.5em)`, gridTemplateColumns: `repeat(${GRID_SIZE}, 2.5em)` }}
      >
        {[...Array(GRID_SIZE * GRID_SIZE)].map((_, i) => (
          <button
            key={i}
            className={`w-10 h-10 sm:w-12 sm:h-12 border border-gray-300 dark:border-gray-700 flex items-center justify-center text-2xl rounded-lg transition-all duration-100 ${i === moleIndex ? 'bg-yellow-400 dark:bg-yellow-600' : 'bg-white dark:bg-gray-900'}`}
            onClick={() => handleWhack(i)}
            disabled={!gameActive}
            aria-label={i === moleIndex ? 'Whack the mole!' : 'Empty hole'}
          >
            {i === moleIndex ? '🐹' : ''}
          </button>
        ))}
      </div>
      {!gameActive && (
        <div className="mt-4 text-yellow-700 dark:text-yellow-300 font-bold">Game Over!
          <button onClick={handleRestart} className="ml-4 px-4 py-2 bg-yellow-600 text-white rounded shadow">Restart</button>
        </div>
      )}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">Tap the mole as fast as you can!</div>
    </div>
  );
}
