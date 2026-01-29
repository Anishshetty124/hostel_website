
import React, { useState, useEffect } from "react";

const DIFFICULTY_SETTINGS = {
  easy: { rows: 8, cols: 8, mines: 10 },
  medium: { rows: 12, cols: 12, mines: 25 },
  hard: { rows: 16, cols: 30, mines: 99 },
};

function createEmptyBoard(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill({
    revealed: false,
    mine: false,
    flagged: false,
    adjacent: 0,
  }));
}

function placeMines(board, rows, cols, mines, initialRow, initialCol) {
  let placed = 0;
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    // Don't place on initial click or already placed
    if ((r === initialRow && c === initialCol) || newBoard[r][c].mine) continue;
    newBoard[r][c].mine = true;
    placed++;
  }
  // Calculate adjacent mine counts
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (newBoard[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newBoard[nr][nc].mine) count++;
        }
      }
      newBoard[r][c].adjacent = count;
    }
  }
  return newBoard;
}

function revealCell(board, row, col, rows, cols) {
  const newBoard = board.map(rowArr => rowArr.map(cell => ({ ...cell })));
  const stack = [[row, col]];
  while (stack.length) {
    const [r, c] = stack.pop();
    if (newBoard[r][c].revealed || newBoard[r][c].flagged) continue;
    newBoard[r][c].revealed = true;
    if (newBoard[r][c].adjacent === 0 && !newBoard[r][c].mine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !newBoard[nr][nc].revealed) {
            stack.push([nr, nc]);
          }
        }
      }
    }
  }
  return newBoard;
}

function checkWin(board, mines) {
  let revealed = 0, total = 0;
  for (let row of board) {
    for (let cell of row) {
      total++;
      if (cell.revealed) revealed++;
    }
  }
  return revealed === total - mines;
}

const Minesweeper = ({ initialDifficulty = "medium" }) => {
  const { rows, cols, mines } = DIFFICULTY_SETTINGS[initialDifficulty] || DIFFICULTY_SETTINGS.medium;
  const [board, setBoard] = useState(() => createEmptyBoard(rows, cols));
  const [minesPlaced, setMinesPlaced] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [flags, setFlags] = useState(0);

  useEffect(() => {
    setBoard(createEmptyBoard(rows, cols));
    setMinesPlaced(false);
    setGameOver(false);
    setWin(false);
    setFlags(0);
  }, [rows, cols, mines]);

  const handleCellClick = (row, col) => {
    if (gameOver || win) return;
    let newBoard = board;
    if (!minesPlaced) {
      newBoard = placeMines(board, rows, cols, mines, row, col);
      setMinesPlaced(true);
    }
    if (newBoard[row][col].flagged) return;
    if (newBoard[row][col].mine) {
      // Reveal all mines
      newBoard = newBoard.map(rowArr => rowArr.map(cell => cell.mine ? { ...cell, revealed: true } : cell));
      setBoard(newBoard);
      setGameOver(true);
      return;
    }
    newBoard = revealCell(newBoard, row, col, rows, cols);
    setBoard(newBoard);
    if (checkWin(newBoard, mines)) {
      setWin(true);
      setGameOver(true);
    }
  };

  const handleRightClick = (e, row, col) => {
    e.preventDefault();
    if (gameOver || win || board[row][col].revealed) return;
    const newBoard = board.map(rowArr => rowArr.map(cell => ({ ...cell })));
    if (newBoard[row][col].flagged) {
      newBoard[row][col].flagged = false;
      setFlags(flags - 1);
    } else if (flags < mines) {
      newBoard[row][col].flagged = true;
      setFlags(flags + 1);
    }
    setBoard(newBoard);
  };

  const resetGame = () => {
    setBoard(createEmptyBoard(rows, cols));
    setMinesPlaced(false);
    setGameOver(false);
    setWin(false);
    setFlags(0);
  };

  return (
    <div className="flex flex-col items-center justify-center p-1 xs:p-2 sm:p-4 w-full">
      <div className="flex flex-wrap items-center gap-2 xs:gap-4 sm:gap-6 mb-2 xs:mb-4 w-full justify-center">
        <span className="text-sm xs:text-base sm:text-lg font-bold">💣 {mines - flags}</span>
        <span className="text-sm xs:text-base sm:text-lg font-bold text-center">{win ? '🎉 You Win!' : gameOver ? '💥 Game Over' : '🙂 Good luck!'}</span>
        <button onClick={resetGame} className="px-2 xs:px-3 py-1 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition text-xs xs:text-sm sm:text-base">Restart</button>
      </div>
      <div
        className="overflow-x-auto overflow-y-auto w-full bg-gray-200 dark:bg-gray-700 rounded-lg shadow-lg p-1 xs:p-2"
        style={{ userSelect: 'none', maxHeight: '65vh', minHeight: '2rem' }}
      >
        <div
          className="grid mx-auto w-full"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(2.2rem, 1fr))`,
            width: '100%',
            maxWidth: '100vw',
            minWidth: `min(100vw, ${cols * 2.2}rem)`,
          }}
        >
          {board.map((rowArr, r) =>
            rowArr.map((cell, c) => (
              <button
                key={r + '-' + c}
                onClick={() => handleCellClick(r, c)}
                onContextMenu={e => handleRightClick(e, r, c)}
                className={`aspect-square min-w-[2.2rem] min-h-[2.2rem] border border-gray-400 dark:border-gray-600 flex items-center justify-center text-base xs:text-lg sm:text-xl font-bold
                  ${cell.revealed ? 'bg-white dark:bg-gray-900' : 'bg-gray-300 dark:bg-gray-800 hover:bg-gray-400 dark:hover:bg-gray-600'}
                  ${cell.revealed && cell.mine ? 'bg-red-200 dark:bg-red-900 animate-pulse' : ''}
                  ${cell.flagged && !cell.revealed ? 'bg-yellow-200 dark:bg-yellow-700' : ''}
                  focus:outline-none`}
                tabIndex={0}
                aria-label={cell.revealed ? (cell.mine ? 'Mine' : cell.adjacent || 'Empty') : cell.flagged ? 'Flagged' : 'Hidden'}
                disabled={cell.revealed || gameOver || win}
                style={{ touchAction: 'manipulation', width: '100%', height: '100%' }}
              >
                {cell.revealed
                  ? cell.mine
                    ? '💣'
                    : cell.adjacent > 0
                      ? cell.adjacent
                      : ''
                  : cell.flagged
                    ? '🚩'
                    : ''}
              </button>
            ))
          )}
        </div>
      </div>
      <div className="mt-2 xs:mt-3 sm:mt-4 text-gray-500 text-xs sm:text-sm text-center w-full">Tap, right-click, or long-press to flag a cell.</div>
    </div>
  );
};

export default Minesweeper;
