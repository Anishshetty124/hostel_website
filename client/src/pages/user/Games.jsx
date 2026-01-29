import { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const GAMES = [
    { id: 'tic-tac-toe', name: 'Tic-Tac-Toe', emoji: '⭕', available: true },
    { id: 'minesweeper', name: 'Minesweeper', emoji: '💣', available: true },
    { id: 'sudoku', name: 'Sudoku', emoji: '🧩', available: true },
    { id: 'memory-match', name: 'Memory Match', emoji: '🃏', available: true },
    { id: 'lights-out', name: 'Lights Out', emoji: '💡', available: true },
];

const Games = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [selectedGame, setSelectedGame] = useState(null);
    const [botDifficulty, setBotDifficulty] = useState('medium');
    const [sudokuDifficulty, setSudokuDifficulty] = useState('medium');
    const [minesweeperDifficulty, setMinesweeperDifficulty] = useState('medium');
    const modalRef = useRef(null);

    // Accessibility: trap focus in modal, close on Escape
    useEffect(() => {
        if (!selectedGame) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') closeModal();
            if (e.key === 'Tab' && modalRef.current) {
                // Trap focus inside modal
                const focusable = modalRef.current.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault(); last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault(); first.focus();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        setTimeout(() => modalRef.current?.focus(), 0);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedGame]);

    const closeModal = () => setSelectedGame(null);

    const playWithBot = (gameId) => {
        if (gameId === 'sudoku') {
            navigate(`/user/sudoku?difficulty=${sudokuDifficulty}`);
            closeModal();
            return;
        }
        if (gameId === 'tic-tac-toe') {
            navigate(`/user/games/tic-tac-toe?bot=true&gameType=tic-tac-toe&difficulty=${botDifficulty}`);
            closeModal();
            return;
        }
        if (gameId === 'minesweeper') {
            navigate(`/user/games/minesweeper?bot=true&gameType=minesweeper&difficulty=${minesweeperDifficulty}`);
            closeModal();
            return;
        }
        if (gameId === 'memory-match') {
            navigate(`/user/MemoryMatch`);
            closeModal();
            return;
        }
        if (gameId === 'lights-out') {
            navigate(`/user/LightsOutGame`);
            closeModal();
            return;
        }
    };

    return (
        <main className="p-1 sm:p-4 max-w-5xl mx-auto w-full min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
            <h1 className="text-xl xs:text-2xl sm:text-4xl font-extrabold mb-4 sm:mb-8 text-center text-gray-900 dark:text-gray-100 tracking-tight">🎮 Play Games</h1>



            <section className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 xs:gap-3 sm:gap-6 mb-6 sm:mb-10 w-full px-1 xs:px-0">
                {GAMES.map(game => (
                    <button
                        key={game.id}
                        onClick={() => setSelectedGame(game)}
                        disabled={!game.available}
                        className={`flex flex-col items-center p-2 xs:p-3 sm:p-6 rounded-2xl border-2 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            game.available
                                ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg cursor-pointer'
                                : 'bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800 cursor-not-allowed opacity-60'
                        }`}
                        tabIndex={game.available ? 0 : -1}
                        aria-label={game.name}
                        style={{ minWidth: '0', minHeight: '0' }}
                    >
                        <span className="text-2xl xs:text-3xl sm:text-5xl mb-1 xs:mb-2 sm:mb-3" aria-hidden="true">{game.emoji}</span>
                        <span className="font-semibold text-sm xs:text-base sm:text-lg text-gray-900 dark:text-gray-100 mb-1 text-center">{game.name}</span>
                        {!game.available && (
                            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">Coming Soon</span>
                        )}
                    </button>
                ))}
            </section>

            {/* Game Lobby Modal */}
            {selectedGame && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-1 xs:p-2 sm:p-4 overflow-y-auto" role="presentation">
                    <div
                        ref={modalRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="lobby-title"
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-2 xs:p-4 sm:p-6 w-full max-w-xs xs:max-w-sm sm:max-w-md focus:outline-none"
                        tabIndex={-1}
                    >
                        <div className="flex items-center justify-between mb-2 xs:mb-4 sm:mb-6">
                            <h2 id="lobby-title" className="text-base xs:text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <span className="text-lg xs:text-xl sm:text-2xl">{selectedGame.emoji}</span> {selectedGame.name} Lobby
                            </h2>
                            <button
                                onClick={closeModal}
                                aria-label="Close game lobby modal"
                                className="text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200 text-lg xs:text-xl sm:text-2xl transition"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                            {selectedGame.id === 'tic-tac-toe' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Difficulty Level
                                    </label>
                                    <div className="flex items-center gap-2 mb-3">
                                        {['easy', 'medium', 'hard'].map(level => (
                                            <button
                                                key={level}
                                                onClick={() => setBotDifficulty(level)}
                                                className={`flex-1 px-3 py-2 rounded text-sm font-medium border transition ${
                                                    botDifficulty === level
                                                        ? 'bg-purple-600 text-white border-purple-600'
                                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:border-purple-500'
                                                }`}
                                                aria-pressed={botDifficulty === level}
                                            >
                                                {level.charAt(0).toUpperCase() + level.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {selectedGame.id === 'minesweeper' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Difficulty Level
                                    </label>
                                    <div className="flex items-center gap-2 mb-3">
                                        {['easy', 'medium', 'hard'].map(level => (
                                            <button
                                                key={level}
                                                onClick={() => setMinesweeperDifficulty(level)}
                                                className={`flex-1 px-3 py-2 rounded text-sm font-medium border transition ${
                                                    minesweeperDifficulty === level
                                                        ? 'bg-purple-600 text-white border-purple-600'
                                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:border-purple-500'
                                                }`}
                                                aria-pressed={minesweeperDifficulty === level}
                                            >
                                                {level.charAt(0).toUpperCase() + level.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {selectedGame.id === 'sudoku' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Difficulty Level
                                    </label>
                                    <div className="flex items-center gap-2 mb-3">
                                        {['easy', 'medium', 'hard'].map(level => (
                                            <button
                                                key={level}
                                                onClick={() => setSudokuDifficulty(level)}
                                                className={`flex-1 px-3 py-2 rounded text-sm font-medium border transition ${
                                                    sudokuDifficulty === level
                                                        ? 'bg-purple-600 text-white border-purple-600'
                                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:border-purple-500'
                                                }`}
                                                aria-pressed={sudokuDifficulty === level}
                                            >
                                                {level.charAt(0).toUpperCase() + level.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Practice locally against a smart AI opponent!
                            </p>
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={closeModal}
                                    aria-label="Close modal"
                                    className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => playWithBot(selectedGame.id)}
                                    aria-label={`Start ${selectedGame.name} game with bot`}
                                    className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition"
                                >
                                    <span aria-hidden="true">🤖</span> Start Game
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Boxes at the bottom */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full justify-center">
                <div className="flex-1 flex items-center justify-center bg-transparent text-gray-700 dark:text-gray-200 font-semibold text-base select-none cursor-default">
                    Multiplayer games with hostellers is coming soon.
                </div>
                <a
                    href="https://poki.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow transition text-base text-center"
                    style={{ textDecoration: 'none' }}
                    role="button"
                >
                    Explore more games
                </a>
            </div>

        </main>
    );
};

export default Games;