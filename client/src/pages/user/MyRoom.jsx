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
                const res = await api.get('/api/rooms/my-room-members', {
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
                    <Home size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">My Room</h1>
                    {roomDetails && (
                        <p className="text-gray-500">Room Number: <span className="font-semibold">{roomDetails.roomNumber}</span></p>
                    )}
                </div>
            </div>
            {loading ? (
                <div className="text-gray-400">Loading room members…</div>
            ) : error ? (
                <div className="text-red-500">{error}</div>
            ) : (
                <div>
                    <h2 className="text-lg font-semibold mb-2">Room Members</h2>
                    {members.length === 0 ? (
                        <div className="text-gray-400">No members found for this room.</div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {members.map((m) => (
                                <li key={m._id} className="py-2 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                                    <span className="font-medium text-gray-800">{m.fullName}</span>
                                    {m.firstName && <span className="text-gray-500 text-sm">({m.firstName})</span>}
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