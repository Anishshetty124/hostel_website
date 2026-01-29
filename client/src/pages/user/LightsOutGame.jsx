import React, { useState } from 'react';

// Lights Out: click tiles to turn all lights off
const SIZE = 5;
function getInitialBoard() {
  return Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => Math.random() < 0.5));
}

function toggle(board, r, c) {
  const dirs = [[0,0],[1,0],[-1,0],[0,1],[0,-1]];
  const newBoard = board.map(row => [...row]);
  for (const [dr, dc] of dirs) {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) newBoard[nr][nc] = !newBoard[nr][nc];
  }
  return newBoard;
}

export default function LightsOutGame() {
  const [board, setBoard] = useState(getInitialBoard());
  const [won, setWon] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const handleClick = (r, c) => {
    if (won) return;
    const newBoard = toggle(board, r, c);
    setBoard(newBoard);
    setWon(newBoard.flat().every(cell => !cell));
  };

  const reset = () => {
    setBoard(getInitialBoard());
    setWon(false);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex w-full justify-between mb-2">
        <button
          className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded text-xs font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition"
          onClick={() => window.history.back()}
        >
          ← Back
        </button>
        <button
          className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded text-xs font-semibold hover:bg-blue-200 dark:hover:bg-blue-800 transition"
          onClick={() => setShowHowToPlay(true)}
        >
          How to Play
        </button>
      </div>
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-1 xs:p-2 sm:p-4 overflow-y-auto" role="presentation">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-4 w-full max-w-xs xs:max-w-sm sm:max-w-md focus:outline-none" tabIndex={-1}>
            <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">How to Play</h2>
            <div className="mb-4 text-gray-700 dark:text-gray-200 text-sm">
              <ul className="list-disc pl-5">
                <li>Click tiles to toggle them and their neighbors.</li>
                <li>Your goal: turn all the lights off!</li>
                <li>Each click affects a cross pattern. Plan your moves!</li>
              </ul>
            </div>
            <button onClick={() => setShowHowToPlay(false)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium">Close</button>
          </div>
        </div>
      )}
      <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-800 dark:text-gray-100">Lights Out</h2>
      <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">Turn off all the lights!</div>
      <div className="grid grid-cols-5 gap-1 bg-gray-200 dark:bg-gray-700 p-4 rounded-xl mb-2">
        {board.map((row, r) => row.map((cell, c) => (
          <button
            key={r + '-' + c}
            onClick={() => handleClick(r, c)}
            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg border-2 transition-all focus:outline-none ${cell ? 'bg-yellow-300 border-yellow-400 shadow-inner' : 'bg-gray-50 border-gray-300 dark:bg-gray-900 dark:border-gray-700'}`}
            aria-label={`Row ${r+1} Col ${c+1}`}
            style={{ boxShadow: cell ? '0 0 8px 0 #fde047' : undefined }}
          />
        )))}
      </div>
      {won && <div className="mt-3 text-green-600 dark:text-green-400 font-semibold">You won!</div>}
      <button onClick={reset} className="mt-4 px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition">Restart</button>
    </div>
  );
}
