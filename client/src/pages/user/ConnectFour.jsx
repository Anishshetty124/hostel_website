import React, { useState } from 'react';

const ROWS = 6;
const COLS = 7;

function getEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function checkWinner(board) {
  // Horizontal, vertical, diagonal checks
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const player = board[r][c];
      if (!player) continue;
      // Horizontal
      if (c + 3 < COLS && player === board[r][c+1] && player === board[r][c+2] && player === board[r][c+3]) return player;
      // Vertical
      if (r + 3 < ROWS && player === board[r+1][c] && player === board[r+2][c] && player === board[r+3][c]) return player;
      // Diagonal right
      if (r + 3 < ROWS && c + 3 < COLS && player === board[r+1][c+1] && player === board[r+2][c+2] && player === board[r+3][c+3]) return player;
      // Diagonal left
      if (r + 3 < ROWS && c - 3 >= 0 && player === board[r+1][c-1] && player === board[r+2][c-2] && player === board[r+3][c-3]) return player;
    }
  }
  return null;
}

export default function ConnectFour() {
  const [board, setBoard] = useState(getEmptyBoard());
  const [player, setPlayer] = useState('🔴');
  const [winner, setWinner] = useState(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const handleDrop = col => {
    if (winner) return;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!board[r][col]) {
        const newBoard = board.map(row => [...row]);
        newBoard[r][col] = player;
        setBoard(newBoard);
        const win = checkWinner(newBoard);
        if (win) setWinner(win);
        else setPlayer(player === '🔴' ? '🟡' : '🔴');
        break;
      }
    }
  };

  const reset = () => {
    setBoard(getEmptyBoard());
    setPlayer('🔴');
    setWinner(null);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Simple SVG Logo */}
      <div className="mb-4">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="30" cy="30" r="28" stroke="#2563eb" strokeWidth="4" fill="#f1f5f9" />
          <circle cx="18" cy="22" r="7" fill="#f87171" stroke="#991b1b" strokeWidth="2" />
          <circle cx="42" cy="22" r="7" fill="#fde047" stroke="#b45309" strokeWidth="2" />
          <circle cx="18" cy="38" r="7" fill="#fde047" stroke="#b45309" strokeWidth="2" />
          <circle cx="42" cy="38" r="7" fill="#f87171" stroke="#991b1b" strokeWidth="2" />
          <text x="30" y="55" textAnchor="middle" fontSize="12" fill="#2563eb" fontWeight="bold">Connect Four</text>
        </svg>
      </div>
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
                <li>Players take turns dropping discs into columns.</li>
                <li>The first to connect four of their discs in a row (horizontally, vertically, or diagonally) wins.</li>
                <li>If the board fills up with no winner, it's a draw.</li>
              </ul>
            </div>
            <button onClick={() => setShowHowToPlay(false)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium">Close</button>
          </div>
        </div>
      )}
      <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-800 dark:text-gray-100">Connect Four</h2>
      <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">Get four in a row to win!</div>
      <div className="mb-2 font-semibold">Current Player: {player}</div>
      <div className="grid grid-cols-7 gap-1 bg-blue-300 dark:bg-blue-800 p-2 rounded-xl mb-2">
        {Array(COLS).fill().map((_, c) => (
          <button
            key={c}
            onClick={() => handleDrop(c)}
            className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-blue-100 dark:bg-blue-900 mb-1 focus:outline-none"
            disabled={winner || board[0][c]}
            aria-label={`Drop in column ${c+1}`}
          >
            ↓
          </button>
        ))}
        {board.flat().map((cell, i) => (
          <div
            key={i}
            className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold transition-all ${cell ? '' : 'bg-white dark:bg-gray-700'}`}
            style={{ background: cell === '🔴' ? '#f87171' : cell === '🟡' ? '#fde047' : undefined }}
          >
            {cell || ''}
          </div>
        ))}
      </div>
      {winner && <div className="mt-3 text-green-600 dark:text-green-400 font-semibold">{winner} wins!</div>}
      <button onClick={reset} className="mt-4 px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition">Restart</button>
    </div>
  );
}