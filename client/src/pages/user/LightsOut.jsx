import React, { useState } from 'react';
  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="mb-4 text-2xl font-bold tracking-tight text-gray-800 dark:text-gray-100">Lights Out</h2>
      <div className="mb-3 text-sm text-gray-500 dark:text-gray-400">Tap tiles to turn off all the lights</div>
      <div
        className="grid grid-cols-5 gap-[2px] bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-700 p-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg"
        style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.04)' }}
      >
        {board.map((row, r) => row.map((cell, c) => (
          <button
            key={r + '-' + c}
            onClick={() => handleClick(r, c)}
            className={`w-11 h-11 sm:w-14 sm:h-14 rounded-md border transition-all
              ${cell ? 'bg-yellow-300 dark:bg-yellow-400 border-yellow-400 dark:border-yellow-300 shadow-inner' : 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700'}
              hover:ring-2 hover:ring-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500`}
            aria-label={`Row ${r+1} Col ${c+1}`}
            style={{
              boxShadow: cell ? '0 0 8px 0 #fde047' : undefined,
              transition: 'box-shadow 0.2s',
            }}
          />
        )))}
      </div>
      {won && <div className="mt-3 text-green-600 dark:text-green-400 font-semibold">You won!</div>}
      <button
        onClick={resetBoard}
        className="mt-5 px-5 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 shadow-sm transition"
      >
        Reset
      </button>
    </div>
  );
    setWon(newBoard.every(cell => !cell));
  };

  const handleRestart = () => {
    setBoard(getInitial());
    setWon(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 text-2xl font-bold text-yellow-700 dark:text-yellow-300">Lights Out</div>
      <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">Turn off all the lights</div>
      <div className="grid grid-cols-5 gap-1 bg-gray-300 dark:bg-gray-700 p-2 rounded-lg">
        {board.map((on, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded transition-all border-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${on ? 'bg-yellow-400 border-yellow-500' : 'bg-gray-900 border-gray-700'}`}
            aria-label={on ? 'Light on' : 'Light off'}
          />
        ))}
      </div>
      {won && <div className="mt-4 text-green-600 dark:text-green-400 font-bold">You solved it!</div>}
      <button onClick={handleRestart} className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded shadow">Restart</button>
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">Tapping toggles a cell and its neighbors.</div>
    </div>
  );
}
