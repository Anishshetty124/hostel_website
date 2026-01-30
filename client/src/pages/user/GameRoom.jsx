import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';

const GameRoom = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user, token } = useContext(AuthContext);
    const [gameRoom, setGameRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [countdownSeconds, setCountdownSeconds] = useState(5);

    useEffect(() => {
        const fetchGameRoom = async () => {
            try {
                setLoading(true);
                const response = await api.get(
                    `/api/games/room/${roomId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setGameRoom(response.data);
                setError(null);
            } catch (err) {
                // Error fetching game room handled
                setError(err.response?.data?.message || 'Failed to load game room');
            } finally {
                setLoading(false);
            }
        };

        if (token && roomId) {
            fetchGameRoom();
        }
    }, [token, roomId]);

    useEffect(() => {
        if (!gameRoom) return;

        // If all players have joined, start game immediately
        if (gameRoom.players.length >= gameRoom.maxPlayers) {
            const timer = setTimeout(() => {
                navigate(`/game/${roomId}?gameType=${gameRoom.gameType}`);
            }, 1000);
            return () => clearTimeout(timer);
        }

        // Show countdown
        if (countdownSeconds <= 0) {
            setCountdownSeconds(5);
            // Refresh room data
            const fetchInterval = setInterval(() => {
                api.get(
                    `/api/games/room/${roomId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                ).then(res => {
                    setGameRoom(res.data);
                    if (res.data.players.length >= res.data.maxPlayers) {
                        navigate(`/game/${roomId}?gameType=${res.data.gameType}`);
                    }
                });
            }, 2000);
            return () => clearInterval(fetchInterval);
        }

        const timer = setTimeout(() => {
            setCountdownSeconds(c => c - 1);
        }, 1000);
        return () => clearTimeout(timer);
    }, [gameRoom, roomId, token, navigate, countdownSeconds]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center max-w-md w-full">
                    <div className="mb-4">
                        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mx-auto flex items-center justify-center text-3xl">
                            🎮
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                        Loading Game Room...
                    </h2>
                    <div className="flex justify-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !gameRoom) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center max-w-md w-full">
                    <div className="mb-4">
                        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto flex items-center justify-center text-3xl">
                            ❌
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Game Room Not Found
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {error || 'The game room could not be loaded'}
                    </p>
                    <button
                        onClick={() => navigate('/user/games')}
                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                    >
                        Back to Games
                    </button>
                </div>
            </div>
        );
    }

    const currentUserId = user?.id || user?._id || user?.userId;
    const isCreator = gameRoom.createdBy._id === currentUserId;
    const playerCount = gameRoom.players.length;
    const maxPlayers = gameRoom.maxPlayers;
    const pendingInvites = gameRoom.invitations.filter(inv => inv.status === 'pending');

    const gameEmoji = {
        'tic-tac-toe': '⭕',
        'minesweeper': '💣',
        // ...existing code...
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 max-w-2xl w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">{gameEmoji[gameRoom.gameType] || '🎮'}</div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {gameRoom.gameType.replace('-', ' ').toUpperCase()}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Waiting for players to join...</p>
                </div>

                {/* Room Info */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Room ID</p>
                            <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                                {roomId}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Players</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {playerCount}/{maxPlayers}
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-300"
                                style={{ width: `${(playerCount / maxPlayers) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Player List */}
                <div className="mb-8">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Players in Room</h3>
                    <div className="space-y-3">
                        {gameRoom.players.map(player => (
                            <div
                                key={player.userId._id}
                                className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                    {player.userId.firstName?.charAt(0) || '?'}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {player.userId.firstName} {player.userId.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Joined {new Date(player.joinedAt).toLocaleTimeString()}
                                    </p>
                                </div>
                                {player.userId._id === currentUserId && (
                                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded">
                                        You
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Pending Invitations */}
                    {pendingInvites.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3 text-sm">
                                Pending Invitations
                            </h4>
                            <div className="space-y-2">
                                {pendingInvites.map(invite => (
                                    <div
                                        key={invite.userId._id}
                                        className="flex items-center gap-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-white text-sm font-bold">
                                            {invite.userId.firstName?.charAt(0) || '?'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {invite.userId.firstName} {invite.userId.lastName}
                                            </p>
                                        </div>
                                        <span className="px-2 py-0.5 bg-yellow-200 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 text-xs font-semibold rounded">
                                            ⏳ Pending
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Status Message */}
                {playerCount >= maxPlayers ? (
                    <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6 text-center">
                        <p className="text-green-700 dark:text-green-400 font-medium">
                            ✅ All players joined! Starting game in {countdownSeconds}s...
                        </p>
                    </div>
                ) : (
                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 text-center">
                        <p className="text-blue-700 dark:text-blue-400 font-medium">
                            Waiting for {maxPlayers - playerCount} more player{maxPlayers - playerCount > 1 ? 's' : ''}...
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                            Checking for new players in {countdownSeconds}s
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/user/games')}
                        className="flex-1 px-4 py-3 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition"
                    >
                        Back to Games
                    </button>
                    {isCreator && (
                        <button
                            onClick={() => navigate(`/game/${roomId}?gameType=${gameRoom.gameType}`)}
                            disabled={playerCount < 2}
                            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
                                playerCount < 2
                                    ? 'bg-gray-400 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed opacity-60'
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                            title={playerCount < 2 ? 'Need at least 2 players' : 'Start game now'}
                        >
                            Start Game
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GameRoom;
