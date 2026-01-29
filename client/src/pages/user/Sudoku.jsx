import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';


// Example boards for each difficulty (could be replaced with a generator)
const BOARDS = {
  easy: [
    [5, 3, '', '', 7, '', '', '', ''],
    [6, '', '', 1, 9, 5, '', '', ''],
    ['', 9, 8, '', '', '', '', 6, ''],
    [8, '', '', '', 6, '', '', '', 3],
    [4, '', '', 8, '', 3, '', '', 1],
    [7, '', '', '', 2, '', '', '', 6],
    ['', 6, '', '', '', '', 2, 8, ''],
    ['', '', '', 4, 1, 9, '', '', 5],
    ['', '', '', '', 8, '', '', 7, 9],
  ],
  medium: [
    ['', '', '', 2, 6, '', 7, '', 1],
    [6, 8, '', '', 7, '', '', 9, ''],
    [1, 9, '', '', '', 4, 5, '', ''],
    [8, 2, '', 1, '', '', '', 4, ''],
    ['', '', 4, 6, '', 2, 9, '', ''],
    ['', 5, '', '', '', 3, '', 2, 8],
    ['', '', 9, 3, '', '', '', 7, 4],
    ['', 4, '', '', 5, '', '', 3, 6],
    [7, '', 3, '', 1, 8, '', '', ''],
  ],
  hard: [
    ['', '', '', '', '', '', '', '', ''],
    ['', '', 3, '', '', '', '', '', 5],
    ['', '', '', '', '', 7, '', '', 8],
    ['', '', '', '', 6, '', '', '', ''],
    ['', '', '', 9, '', 1, '', '', ''],
    ['', '', '', '', 2, '', '', '', ''],
    [2, '', '', 8, '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],
  ],
};

function isValid(board, row, col, val) {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === val || board[i][col] === val) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    if (board[boxRow + r][boxCol + c] === val) return false;
  }
  return true;
}


export default function Sudoku() {
  const [searchParams] = useSearchParams();
  const difficulty = searchParams.get('difficulty') || 'medium';
  const initialBoard = BOARDS[difficulty] || BOARDS.medium;
  const [board, setBoard] = useState(initialBoard);
  const [selected, setSelected] = useState([0, 0]);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  const handleCellSelect = (r, c) => {
    setSelected([r, c]);
    setError('');
  };

  const handleNumberInput = (num) => {
    const [r, c] = selected;
    if (initialBoard[r][c] !== '') return;
    if (num === '' || isValid(board, r, c, num)) {
      setHistory(h => [...h, board.map(row => [...row])]);
      const newBoard = board.map(row => [...row]);
      newBoard[r][c] = num;
      setBoard(newBoard);
      setError('');
    } else {
      setError('Invalid move');
    }
  };

  const handleClear = () => {
    const [r, c] = selected;
    if (initialBoard[r][c] !== '') return;
    setHistory(h => [...h, board.map(row => [...row])]);
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = '';
    setBoard(newBoard);
    setError('');
  };

  const handleUndo = () => {
    setHistory(h => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setBoard(prev);
      return h.slice(0, -1);
    });
    setError('');
  };

  // Navigation
  const handleBack = () => {
    window.history.length > 1 ? window.history.back() : window.location.assign('/user/games');
  };

  return (
    <div className="flex flex-col items-center w-full px-1 xs:px-2 sm:px-0">
      <div className="w-full flex items-center justify-between mb-1 xs:mb-2">
        <button
          onClick={handleBack}
          className="px-2 xs:px-3 py-1 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 text-xs xs:text-sm font-medium transition"
        >
          ← Back
        </button>
        <h2 className="text-lg xs:text-xl sm:text-2xl font-bold tracking-tight text-gray-800 dark:text-gray-100 mx-auto">Sudoku</h2>
        <span className="w-8 xs:w-12" />
      </div>
      <div className="mb-2 xs:mb-3 text-xs xs:text-sm text-gray-500 dark:text-gray-400">Tap a cell, then select a number below</div>
      <div
        className="relative p-1 xs:p-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-700 w-full max-w-[95vw] xs:max-w-xs sm:max-w-md md:max-w-lg"
        style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.04)' }}
      >
        {/* Overlay for thick box lines */}
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* Vertical box lines */}
          <div className="absolute top-0 bottom-0 left-1/3 w-0.5 bg-gray-400 dark:bg-gray-600 opacity-70" style={{left: '33.33%'}} />
          <div className="absolute top-0 bottom-0 left-2/3 w-0.5 bg-gray-400 dark:bg-gray-600 opacity-70" style={{left: '66.66%'}} />
          {/* Horizontal box lines */}
          <div className="absolute left-0 right-0 top-1/3 h-0.5 bg-gray-400 dark:bg-gray-600 opacity-70" style={{top: '33.33%'}} />
          <div className="absolute left-0 right-0 top-2/3 h-0.5 bg-gray-400 dark:bg-gray-600 opacity-70" style={{top: '66.66%'}} />
        </div>
        <div className="grid grid-cols-9 gap-[2px] xs:gap-[3px] relative z-0" style={{maxWidth: '99vw'}}>
          {board.map((row, r) => row.map((cell, c) => {
            const isInitial = initialBoard[r][c] !== '';
            const isSelected = selected[0] === r && selected[1] === c;
            // Thin grid lines, thick for box edges
            const borderClasses = [
              c % 3 === 0 ? 'border-l-2 border-gray-400 dark:border-gray-600' : 'border-l border-gray-300 dark:border-gray-700',
              r % 3 === 0 ? 'border-t-2 border-gray-400 dark:border-gray-600' : 'border-t border-gray-300 dark:border-gray-700',
              c === 8 ? 'border-r-2 border-gray-400 dark:border-gray-600' : '',
              r === 8 ? 'border-b-2 border-gray-400 dark:border-gray-600' : '',
            ].join(' ');
            return (
              <button
                key={r + '-' + c}
                onClick={() => handleCellSelect(r, c)}
                className={`w-9 h-9 xs:w-11 xs:h-11 sm:w-14 sm:h-14 text-center border-0 text-base xs:text-lg sm:text-2xl font-semibold transition-all
                  ${isInitial ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 cursor-pointer'}
                  ${isSelected ? 'ring-2 ring-blue-500 z-10' : ''}
                  ${borderClasses}
                  focus:outline-none focus:ring-2 focus:ring-blue-400`}
                disabled={isInitial}
                aria-label={`Row ${r+1} Col ${c+1}`}
                style={{ boxShadow: isSelected ? '0 0 0 2px #3b82f6' : undefined, fontVariantNumeric: 'tabular-nums' }}
              >{cell}</button>
            );
          }))}
        </div>
      </div>
      {/* Number pad */}
      <div className="flex flex-wrap justify-center gap-1 xs:gap-2 mt-2 xs:mt-4 w-full max-w-[95vw] xs:max-w-xs sm:max-w-md">
        {[1,2,3,4,5,6,7,8,9].map(num => (
          <button
            key={num}
            onClick={() => handleNumberInput(num)}
            className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-200 dark:bg-gray-800 text-base xs:text-lg font-bold text-gray-800 dark:text-gray-100 hover:bg-blue-200 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            aria-label={`Input ${num}`}
          >{num}</button>
        ))}
        <button
          onClick={handleClear}
          className="w-12 h-8 xs:w-16 xs:h-10 sm:w-20 sm:h-12 rounded-lg bg-gray-100 dark:bg-gray-700 text-xs xs:text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-red-100 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition ml-1 xs:ml-2"
          aria-label="Clear cell"
        >Clear</button>
      </div>
      {/* Undo button */}
      <div className="flex gap-2 mt-2 xs:mt-3">
        <button
          onClick={handleUndo}
          className="px-2 xs:px-4 py-1 xs:py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-xs xs:text-base"
        >Undo</button>
      </div>
      {error && <div className="mt-2 text-red-600 dark:text-red-400 font-semibold">{error}</div>}
      <div className="mt-3 xs:mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">Fill the grid so every row, column, and 3x3 box contains 1-9.</div>
    </div>
  );
}
