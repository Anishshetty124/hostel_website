import { useContext, useEffect, useState } from 'react';
import { Home } from 'lucide-react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';

const MyRoom = () => {
    const { user, token } = useContext(AuthContext);
    const [members, setMembers] = useState([]);
    const [roomDetails, setRoomDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRoomInfo = async () => {
            if (!user?.roomNumber) {
                setError('No room number found for your account.');
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                // Fetch all members in the same room (user endpoint)
                const res = await api.get('/rooms/my-room-members', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMembers(res.data || []);
                setRoomDetails({ roomNumber: user.roomNumber });
            } catch (err) {
                setError('Failed to fetch room info.');
            } finally {
                setLoading(false);
            }
        };
        if (user && token) fetchRoomInfo();
    }, [user, token]);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                    <Home size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">My Room</h1>
                    {roomDetails && (
                        <p className="text-gray-500 dark:text-gray-400">Room Number: <span className="font-semibold">{roomDetails.roomNumber}</span></p>
                    )}
                </div>
            </div>
            {loading ? (
                <div className="text-gray-400 dark:text-gray-500">Loading room members…</div>
            ) : error ? (
                <div className="text-red-500 dark:text-red-400">{error}</div>
            ) : (
                <div>
                    <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Room Members</h2>
                    {members.length === 0 ? (
                        <div className="text-gray-400 dark:text-gray-500">No members found for this room.</div>
                    ) : (
                        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                            {members.map((m) => (
                                <li key={m._id} className="py-2 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{m.fullName}</span>
                                    {m.firstName && <span className="text-gray-500 dark:text-gray-400 text-sm">({m.firstName})</span>}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyRoom;