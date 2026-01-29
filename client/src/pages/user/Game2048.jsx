import React, { useState, useEffect } from 'react';

// Simple 2048 logic for 4x4 grid
const SIZE = 4;
const getEmptyBoard = () => Array(SIZE).fill().map(() => Array(SIZE).fill(0));

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function addRandomTile(board) {
  const empty = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (board[r][c] === 0) empty.push([r, c]);
  if (empty.length === 0) return board;
  const [r, c] = empty[getRandomInt(empty.length)];
  board[r][c] = Math.random() < 0.9 ? 2 : 4;
  return board;
}

function moveLeft(board) {
  let moved = false;
  let score = 0;
  const newBoard = board.map(row => {
    let arr = row.filter(x => x !== 0);
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] && arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        score += arr[i];
        arr[i + 1] = 0;
        moved = true;
      }
    }
    arr = arr.filter(x => x !== 0);
    while (arr.length < SIZE) arr.push(0);
    if (arr.join() !== row.join()) moved = true;
    return arr;
  });
  return { newBoard, moved, score };
}

function rotate(board) {
  // Rotate 90 degrees clockwise
  return board[0].map((_, i) => board.map(row => row[i]).reverse());
}

function canMove(board) {
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    if (board[r][c] === 0) return true;
    if (c < SIZE - 1 && board[r][c] === board[r][c + 1]) return true;
    if (r < SIZE - 1 && board[r][c] === board[r + 1][c]) return true;
  }
  return false;
}

export default function Game2048() {
  const [board, setBoard] = useState(() => addRandomTile(addRandomTile(getEmptyBoard())));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  useEffect(() => {
    const handleKey = e => {
      if (gameOver) return;
      let b = board.map(row => [...row]);
      let s = 0;
      let moved = false;
      if (e.key === 'ArrowLeft') {
        ({ newBoard: b, moved, score: s } = moveLeft(b));
      } else if (e.key === 'ArrowRight') {
        b = rotate(rotate(b));
        ({ newBoard: b, moved, score: s } = moveLeft(b));
        b = rotate(rotate(b));
      } else if (e.key === 'ArrowUp') {
        b = rotate(rotate(rotate(b)));
        ({ newBoard: b, moved, score: s } = moveLeft(b));
        b = rotate(b);
      } else if (e.key === 'ArrowDown') {
        b = rotate(b);
        ({ newBoard: b, moved, score: s } = moveLeft(b));
        b = rotate(rotate(rotate(b)));
      }
      if (moved) {
        b = addRandomTile(b);
        setBoard(b);
        setScore(prev => prev + s);
        if (!canMove(b)) setGameOver(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [board, gameOver]);

  const reset = () => {
    setBoard(addRandomTile(addRandomTile(getEmptyBoard())));
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <button
        className="mb-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded text-xs font-semibold hover:bg-blue-200 dark:hover:bg-blue-800 transition self-end"
        onClick={() => setShowHowToPlay(true)}
      >
        How to Play
      </button>
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-1 xs:p-2 sm:p-4 overflow-y-auto" role="presentation">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-4 w-full max-w-xs xs:max-w-sm sm:max-w-md focus:outline-none" tabIndex={-1}>
            <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">How to Play</h2>
            <div className="mb-4 text-gray-700 dark:text-gray-200 text-sm">
              <ul className="list-disc pl-5">
                <li>Use arrow keys to slide all tiles in one direction.</li>
                <li>When two tiles with the same number touch, they merge into one.</li>
                <li>After each move, a new tile (2 or 4) appears in a random empty spot.</li>
                <li>Try to reach the 2048 tile. The game ends when no moves are possible.</li>
              </ul>
            </div>
            <button onClick={() => setShowHowToPlay(false)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium">Close</button>
          </div>
        </div>
      )}
      <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-800 dark:text-gray-100">2048</h2>
      <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">Use arrow keys to move tiles. Combine numbers to reach 2048!</div>
      <div className="mb-2 font-semibold">Score: {score}</div>
      <div className="grid grid-cols-4 gap-2 bg-gray-200 dark:bg-gray-700 p-4 rounded-xl">
        {board.flat().map((cell, i) => (
          <div key={i} className={`w-14 h-14 flex items-center justify-center rounded-lg font-bold text-lg sm:text-2xl transition-all ${cell ? 'bg-yellow-300 dark:bg-yellow-500 text-gray-900' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
            {cell || ''}
          </div>
        ))}
      </div>
      {gameOver && <div className="mt-3 text-red-600 dark:text-red-400 font-semibold">Game Over!</div>}
      <button onClick={reset} className="mt-4 px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition">Restart</button>
    </div>
  );
}
