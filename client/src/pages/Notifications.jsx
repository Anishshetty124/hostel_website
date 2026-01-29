import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Notifications = () => {
  const { token } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const handleRemove = async (id) => {
    setRemovingId(id);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`/api/notifications/${id}`, { headers });
      setNotifications(notifications => notifications.filter(n => n._id !== id));
    } catch (err) {
      // Optionally show error
    } finally {
      setRemovingId(null);
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get('/api/notifications', { headers });
        setNotifications(res.data || []);
      } catch (err) {
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [token]);

  if (loading) return <LoadingSpinner fullScreen message="Loading notifications..." />;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Notifications</h1>
      {notifications.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 text-center">No notifications yet.</div>
      ) : (
        <ul className="space-y-4">
          {notifications.map((n, i) => (
            <li key={n._id || i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700 relative group flex flex-col">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 text-lg font-bold p-1 rounded transition"
                title="Remove notification"
                onClick={() => handleRemove(n._id)}
                disabled={removingId === n._id}
                style={{ opacity: removingId === n._id ? 0.5 : 1 }}
              >
                {removingId === n._id ? (
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></span>
                ) : (
                  <span>&times;</span>
                )}
              </button>
              <div className="font-semibold text-gray-900 dark:text-gray-100">{n.title || 'Notice'}</div>
              <div className="text-gray-700 dark:text-gray-300 mt-1">{n.message}</div>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-400">
                <span>{new Date(n.createdAt).toLocaleString()}</span>
                {n.senderName && (
                  <span className="text-indigo-600 dark:text-indigo-300 font-medium">From: {n.senderName}</span>
                )}
                {n.type && (
                  <span className={
                    n.type === 'notice'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded'
                      : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded'
                  }>
                    {n.type === 'notice' ? 'Notice from Admin/Warden' : 'Personal Message'}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
