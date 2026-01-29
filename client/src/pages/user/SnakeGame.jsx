import React, { useState, useEffect, useRef } from 'react';

const GRID_SIZE = 15;
const INITIAL_SNAKE = [
  { x: 7, y: 7 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const SPEED = 120;

function getRandomFood(snake) {
  let newFood;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    if (!snake.some(seg => seg.x === newFood.x && seg.y === newFood.y)) break;
  }
  return newFood;
}

export default function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(getRandomFood(INITIAL_SNAKE));
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const moveRef = useRef(direction);
  const snakeRef = useRef(snake);

  useEffect(() => { moveRef.current = direction; }, [direction]);
  useEffect(() => { snakeRef.current = snake; }, [snake]);

  useEffect(() => {
    if (gameOver) return;
    const handleKey = e => {
      if (e.key === 'ArrowUp' && moveRef.current.y !== 1) setDirection({ x: 0, y: -1 });
      if (e.key === 'ArrowDown' && moveRef.current.y !== -1) setDirection({ x: 0, y: 1 });
      if (e.key === 'ArrowLeft' && moveRef.current.x !== 1) setDirection({ x: -1, y: 0 });
      if (e.key === 'ArrowRight' && moveRef.current.x !== -1) setDirection({ x: 1, y: 0 });
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setSnake(prev => {
        const newHead = {
          x: (prev[0].x + moveRef.current.x + GRID_SIZE) % GRID_SIZE,
          y: (prev[0].y + moveRef.current.y + GRID_SIZE) % GRID_SIZE,
        };
        if (prev.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
          setGameOver(true);
          return prev;
        }
        let newSnake = [newHead, ...prev];
        if (newHead.x === food.x && newHead.y === food.y) {
          setFood(getRandomFood(newSnake));
          setScore(s => s + 1);
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, SPEED);
    return () => clearInterval(interval);
  }, [food, gameOver]);

  const handleRestart = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(getRandomFood(INITIAL_SNAKE));
    setGameOver(false);
    setScore(0);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 text-2xl font-bold text-green-700 dark:text-green-300">Snake Game</div>
      <div className="mb-2">Score: <span className="font-bold">{score}</span></div>
      <div
        className="grid bg-gray-200 dark:bg-gray-800 rounded-lg"
        style={{ gridTemplateRows: `repeat(${GRID_SIZE}, 1.2em)`, gridTemplateColumns: `repeat(${GRID_SIZE}, 1.2em)` }}
      >
        {[...Array(GRID_SIZE * GRID_SIZE)].map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const isSnake = snake.some(seg => seg.x === x && seg.y === y);
          const isHead = snake[0].x === x && snake[0].y === y;
          const isFood = food.x === x && food.y === y;
          return (
            <div
              key={i}
              className={`w-5 h-5 sm:w-6 sm:h-6 border border-gray-300 dark:border-gray-700 flex items-center justify-center ${isHead ? 'bg-green-600 dark:bg-green-400' : isSnake ? 'bg-green-300 dark:bg-green-700' : isFood ? 'bg-red-500' : ''}`}
              style={{ borderRadius: isHead ? '50%' : isFood ? '30%' : '0' }}
            >
              {isFood ? '🍎' : ''}
            </div>
          );
        })}
      </div>
      {gameOver && (
        <div className="mt-4 text-red-600 dark:text-red-400 font-bold">Game Over!
          <button onClick={handleRestart} className="ml-4 px-4 py-2 bg-green-600 text-white rounded shadow">Restart</button>
        </div>
      )}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">Use arrow keys to move. Eat apples, avoid yourself!</div>
    </div>
  );
}
