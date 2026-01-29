import React, { useState } from 'react';

  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="mb-4 text-2xl font-bold tracking-tight text-gray-800 dark:text-gray-100">Nonogram</h2>
      <div className="mb-3 text-sm text-gray-500 dark:text-gray-400">Fill the grid to match the clues</div>
      <div className="flex">
        <div className="flex flex-col justify-end mr-2">
          {rowClues.map((clue, i) => (
            <div key={i} className="h-9 sm:h-11 flex items-center justify-end pr-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-mono">{clue.join(' ')}</div>
          ))}
        </div>
        <div>
          <div className="flex mb-2">
            <div className="w-9 sm:w-11" />
            {colClues.map((clue, i) => (
              <div key={i} className="w-9 sm:w-11 flex flex-col items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-mono">{clue.join(' ')}</div>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-[2px] bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-700 p-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
            {board.map((row, r) => row.map((cell, c) => (
              <button
                key={r + '-' + c}
                onClick={() => handleCell(r, c)}
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-md border transition-all
                  ${cell === 1 ? 'bg-purple-500 dark:bg-purple-400 border-purple-600 dark:border-purple-300 shadow-inner' : cell === -1 ? 'bg-gray-400 dark:bg-gray-800 border-gray-500 dark:border-gray-700' : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700'}
                  hover:ring-2 hover:ring-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                aria-label={`Row ${r+1} Col ${c+1}`}
                style={{
                  boxShadow: cell === 1 ? '0 0 8px 0 #a78bfa' : undefined,
                  transition: 'box-shadow 0.2s',
                }}
              />
            )))}
          </div>
        </div>
      </div>
      {won && <div className="mt-3 text-green-600 dark:text-green-400 font-semibold">You solved it!</div>}
      <button
        onClick={resetBoard}
        className="mt-5 px-5 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 shadow-sm transition"
      >
        Reset
      </button>
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 text-2xl font-bold text-indigo-700 dark:text-indigo-300">Nonogram</div>
      <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">Fill the grid to match the clues</div>
      <div className="flex">
        {/* Row clues */}
        <div className="flex flex-col justify-end mr-2">
          {rowClues.map((clue, i) => (
            <div key={i} className="h-8 sm:h-10 flex items-center justify-end text-xs sm:text-sm text-gray-700 dark:text-gray-300">{clue.join(' ')}</div>
          ))}
        </div>
        <div>
          {/* Column clues */}
          <div className="flex mb-1 ml-8">
            {colClues.map((clue, i) => (
              <div key={i} className="w-8 sm:w-10 text-center text-xs sm:text-sm text-gray-700 dark:text-gray-300">{clue.join(' ')}</div>
            ))}
          </div>
          {/* Grid */}
          <div className="grid grid-cols-5 gap-1 bg-gray-300 dark:bg-gray-700 p-2 rounded-lg">
            {grid.map((row, r) => row.map((cell, c) => (
              <button
                key={r + '-' + c}
                onClick={() => handleCell(r, c)}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded border-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all
                  ${cell === 1 ? 'bg-indigo-600 border-indigo-700' : cell === 2 ? 'bg-gray-400 border-gray-500' : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700'}`}
                aria-label={`Cell ${r+1},${c+1}`}
              />
            )))}
          </div>
        </div>
      </div>
      {solved && <div className="mt-4 text-green-600 dark:text-green-400 font-bold">Puzzle solved!</div>}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">Tap to cycle: filled, X, empty. Match the clues for each row and column.</div>
    </div>
  );
}
