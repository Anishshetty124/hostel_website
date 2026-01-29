
import { useState, useEffect } from 'react';
import Minesweeper from '../../components/Minesweeper';
import { useSearchParams, useNavigate } from 'react-router-dom';

const TicTacToe = ({ board, myTurn, onMove, winner, isDraw }) => {
    const handleClick = (index) => {
        if (!myTurn || board[index] || winner || isDraw) return;
        onMove(index);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-2 sm:p-4">
            <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-xs sm:max-w-md aspect-square">
                {board.map((cell, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleClick(idx)}
                        disabled={!myTurn || cell !== null || winner || isDraw}
                        className={`
                            aspect-square rounded-lg text-3xl sm:text-5xl font-bold flex items-center justify-center
                            transition-all duration-200
                            ${cell === null ? 'bg-gray-100 dark:bg-gray-700' : 'bg-blue-50 dark:bg-blue-900/30'}
                            ${myTurn && !cell && !winner && !isDraw ? 'hover:bg-blue-100 dark:hover:bg-blue-800/40 cursor-pointer' : 'cursor-not-allowed'}
                            ${cell === 'X' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}
                        `}
                        style={{ minWidth: '2.5rem', minHeight: '2.5rem', touchAction: 'manipulation' }}
                    >
                        {cell}
                    </button>
                ))}
            </div>
        </div>
    );
};

const GameArena = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const isBot = searchParams.get('bot') === 'true';
    const gameType = searchParams.get('gameType');
    const botDifficulty = searchParams.get('difficulty') || 'medium';

    const [winner, setWinner] = useState(null);
    const [isDraw, setIsDraw] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [botBoard, setBotBoard] = useState(isBot && gameType === 'tic-tac-toe' ? Array(9).fill(null) : null);
    const [botTurn, setBotTurn] = useState(isBot ? false : null); // false = player, true = bot


    // Improved bot logic for single-player
    function getRandomMove(board) {
        const empty = board.map((cell, i) => cell === null ? i : null).filter(i => i !== null);
        if (empty.length === 0) return -1;
        return empty[Math.floor(Math.random() * empty.length)];
    }

    function getWinningMove(board, symbol) {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        for (let line of lines) {
            const [a, b, c] = line;
            const values = [board[a], board[b], board[c]];
            if (values.filter(v => v === symbol).length === 2 && values.includes(null)) {
                return line[values.indexOf(null)];
            }
        }
        return -1;
    }

    function minimax(board, isBot) {
        const winner = checkWinner(board);
        if (winner === 'O') return { score: 1 };
        if (winner === 'X') return { score: -1 };
        if (!board.includes(null)) return { score: 0 };
        let best;
        if (isBot) {
            best = { score: -Infinity };
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'O';
                    let res = minimax(board, false);
                    board[i] = null;
                    if (res.score > best.score) best = { score: res.score, move: i };
                }
            }
        } else {
            best = { score: Infinity };
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'X';
                    let res = minimax(board, true);
                    board[i] = null;
                    if (res.score < best.score) best = { score: res.score, move: i };
                }
            }
        }
        return best;
    }

    const botInstance = {
        getTicTacToeMove: (board) => {
            if (botDifficulty === 'easy') {
                return getRandomMove(board);
            } else if (botDifficulty === 'medium') {
                // Try to win
                let move = getWinningMove(board, 'O');
                if (move !== -1) return move;
                // Block player win
                move = getWinningMove(board, 'X');
                if (move !== -1) return move;
                // Otherwise random
                return getRandomMove(board);
            } else if (botDifficulty === 'hard') {
                const { move } = minimax([...board], true);
                return move !== undefined ? move : getRandomMove(board);
            }
            // fallback
            return getRandomMove(board);
        }
    };

    const handleLeaveGame = () => {
        navigate('/user/games');
    };

    // DEBUG: Show banner to confirm GameArena is mounting
    if (typeof window !== 'undefined') {
        window.__GAMEARENA_MOUNTED = true;
    }
    // Render single-player games immediately (no multiplayer state needed)
    if (gameType === 'minesweeper') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex flex-col items-center justify-center">
                <div className="max-w-2xl w-full">
                    <div className="mb-4 flex items-center justify-between">
                        <button
                            onClick={handleLeaveGame}
                            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm font-medium transition"
                        >
                            ← Back
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mx-auto">💣 Minesweeper</h1>
                        <span className="w-12" />
                    </div>
                    <Minesweeper initialDifficulty={botDifficulty} />
                </div>
            </div>
        );
    }

    // Show error if gameType is missing or invalid
    if (!gameType || !['tic-tac-toe', 'minesweeper'].includes(gameType)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="bg-white dark:bg-gray-800 p-8 rounded shadow text-center">
                    <h2 className="text-2xl font-bold mb-4 text-red-600">Invalid or missing game type!</h2>
                    <p className="mb-4">Please select a valid game from the games menu.</p>
                    <button
                        onClick={() => navigate('/user/games')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                    >
                        Back to Games
                    </button>
                </div>
            </div>
        );
    }


    const handleMove = (index) => {
        if (isBot && gameType === 'tic-tac-toe') {
            // Handle bot game move
            if (!botInstance || botBoard[index] !== null || botTurn) return;
            
            const newBoard = [...botBoard];
            newBoard[index] = 'X';
            setBotBoard(newBoard);

            // Check if player won
            const playerWon = checkWinner(newBoard) === 'X';
            if (playerWon) {
                setWinner('You');
                setShowResultModal(true);
                return;
            }

            // Check for draw
            if (!newBoard.includes(null)) {
                setIsDraw(true);
                setShowResultModal(true);
                return;
            }

            // Bot makes move
            setBotTurn(true);
            setTimeout(() => {
                const botMove = botInstance.getTicTacToeMove(newBoard);
                if (botMove >= 0) {
                    newBoard[botMove] = 'O';
                    setBotBoard(newBoard);

                    // Check if bot won
                    const botWon = checkWinner(newBoard) === 'O';
                    if (botWon) {
                        setWinner('Bot');
                        setShowResultModal(true);
                        setBotTurn(false);
                        return;
                    }

                    // Check for draw
                    if (!newBoard.includes(null)) {
                        setIsDraw(true);
                        setShowResultModal(true);
                        setBotTurn(false);
                        return;
                    }
                }
                setBotTurn(false);
            }, 800);
        }
    };

    const checkWinner = (board) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
            [0, 4, 8], [2, 4, 6] // diagonals
        ];
        
        for (let line of lines) {
            const [a, b, c] = line;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    };

    // Removed unused sendChatMessage and related state



    // Handle bot game rendering
    if (isBot && gameType === 'tic-tac-toe') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
                {/* Header */}
                <div className="max-w-7xl mx-auto mb-2 xs:mb-4 flex flex-col xs:flex-row items-center xs:justify-between gap-2 xs:gap-0">
                    <div className="flex w-full xs:w-auto items-center justify-between xs:justify-start gap-2">
                        <button
                            onClick={handleLeaveGame}
                            className="px-2 xs:px-3 py-1 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 text-xs xs:text-sm font-medium transition"
                        >
                            ← Back
                        </button>
                        <h1 className="text-base xs:text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mx-auto xs:mx-0 text-center xs:text-left w-full xs:w-auto">
                            ⭕ Tic-Tac-Toe vs Bot
                        </h1>
                    </div>
                </div>
                {/* Game Layout */}
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Left: Player Card */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl font-bold bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                                    YOU
                                </div>
                                <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">You (X)</div>
                                <div className={`text-sm ${!botTurn ? 'text-green-600 font-bold' : 'text-gray-500'}`}>
                                    {!botTurn ? '✓ Your Turn' : 'Waiting...'}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Center: Game Board */}
                    <div className="lg:col-span-6 flex items-center justify-center">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full">
                            <TicTacToe 
                                board={botBoard}
                                myTurn={!botTurn}
                                onMove={handleMove}
                                winner={winner}
                                isDraw={isDraw}
                            />
                        </div>
                    </div>
                    {/* Right: Bot Card */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl font-bold bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400">
                                    🤖
                                </div>
                                <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Bot (O)</div>
                                <div className={`text-sm ${botTurn ? 'text-green-600 font-bold' : 'text-gray-500'}`}>
                                    {botTurn ? '🤔 Thinking...' : 'Waiting...'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Result Modal */}
                {showResultModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md text-center">
                            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                                {isDraw ? '🤝 It\'s a Draw!' : winner === 'You' ? '🎉 You Won!' : '🤖 Bot Won!'}
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
                                >
                                    Play Again
                                </button>
                                <button
                                    onClick={handleLeaveGame}
                                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium"
                                >
                                    Back to Games
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
export default GameArena;
