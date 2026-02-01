import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Edit2, Trash2 } from 'lucide-react';

const SendNotice = () => {
  const [type, setType] = useState('public');
  const [recipient, setRecipient] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const suggestionsRef = useRef(null);
  // Fetch all users for suggestions (admin only)
  useEffect(() => {
    if (type === 'private') {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      api.get('/auth/users/all', config)
        .then(res => setAllUsers(res.data || []))
        .catch(() => setAllUsers([]));
    }
  }, [type]);

  // Fetch sent notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      setLoadingNotifications(true);
      try {
        const res = await api.get('/notifications/admin/sent', config);
        setNotifications(res.data || []);
      } catch (err) {
        console.error('Failed to fetch notifications');
      } finally {
        setLoadingNotifications(false);
      }
    };
    fetchNotifications();
  }, []);

  // Socket.io listeners for real-time notification updates
  useEffect(() => {
    const socket = io();

    // Listen for new notifications created by any admin
    socket.on('notification:created', (notification) => {
      setNotifications((prev) => {
        const exists = prev.some((n) => n._id === notification._id);
        if (!exists) {
          return [notification, ...prev];
        }
        return prev;
      });
    });

    // Listen for updated notifications
    socket.on('notification:updated', (updatedNotification) => {
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === updatedNotification._id ? updatedNotification : n
        )
      );
    });

    // Listen for deleted notifications
    socket.on('notification:deleted', (notificationId) => {
      setNotifications((prev) =>
        prev.filter((n) => n._id !== notificationId)
      );
    });

    return () => {
      socket.off('notification:created');
      socket.off('notification:updated');
      socket.off('notification:deleted');
    };
  }, []);

  // Filter suggestions as recipient input changes
  useEffect(() => {
    if (type === 'private' && recipient) {
      const q = recipient.toLowerCase();
      const filtered = allUsers.filter(u =>
        (u.firstName && u.firstName.toLowerCase().includes(q)) ||
        (u.lastName && u.lastName.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
      ).slice(0, 5);
      setUserSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [recipient, allUsers, type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await api.post(
        '/notifications/send',
        { type, recipient, title, message },
        config
      );
      setStatus('Notification sent successfully!');
      setTitle('');
      setMessage('');
      setRecipient('');
      // Add to list
      setNotifications(prev => [res.data.notification, ...prev]);
    } catch (err) {
      setStatus('Failed to send notification.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStart = (notif) => {
    setEditingId(notif._id);
    setEditTitle(notif.title);
    setEditMessage(notif.message);
  };

  const handleEditSave = async (notifId) => {
    if (!editTitle.trim() || !editMessage.trim()) {
      setStatus('Title and message cannot be empty');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await api.put(
        `/notifications/${notifId}`,
        { title: editTitle, message: editMessage },
        config
      );
      setNotifications(prev => prev.map(n => 
        n._id === notifId ? res.data.notification : n
      ));
      setEditingId(null);
      setStatus('Notification updated successfully!');
    } catch (err) {
      setStatus('Failed to update notification');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (notifId) => {
    if (!window.confirm('Delete this notification? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await api.delete(
        `/notifications/${notifId}/admin`,
        config
      );
      setNotifications(prev => prev.filter(n => n._id !== notifId));
      setStatus('Notification deleted successfully!');
    } catch (err) {
      setStatus('Failed to delete notification');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow p-6 mt-8 mb-8">
      {status && <div className={`mb-4 p-3 rounded text-center font-semibold ${status.includes('success') ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'}`}>{status}</div>}
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Send Notice / Message</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
        <div>
          <label className="block font-semibold mb-1">Type</label>
          <select
            className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            value={type}
            onChange={e => setType(e.target.value)}
          >
            <option value="public">Public Notice (everyone)</option>
            <option value="private">Private Message (one user)</option>
          </select>
        </div>
        {type === 'private' && (
          <div className="relative">
            <label className="block font-semibold mb-1">Recipient Username or Email</label>
            <input
              className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
              onFocus={() => setShowSuggestions(userSuggestions.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              required={type === 'private'}
              autoComplete="off"
            />
            {showSuggestions && (
              <ul ref={suggestionsRef} className="absolute z-10 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow mt-1 max-h-48 overflow-y-auto">
                {userSuggestions.map((u, idx) => (
                  <li
                    key={u.email + idx}
                    className="px-3 py-2 cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900"
                    onMouseDown={() => {
                      setRecipient(u.email);
                      setShowSuggestions(false);
                    }}
                  >
                    <span className="font-medium text-gray-900 dark:text-gray-100">{u.firstName} {u.lastName}</span>
                    <span className="text-xs text-gray-500 ml-2">{u.email}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <div>
          <label className="block font-semibold mb-1">Title</label>
          <input
            className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Message</label>
          <textarea
            className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
            rows={4}
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
          disabled={loading}
        >
          {loading ? <LoadingSpinner message="Sending..." /> : 'Send'}
        </button>
      </form>

      {/* Sent Notifications List */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Sent Notifications ({notifications.length})
        </h2>
        {loadingNotifications ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">No notifications sent yet</div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.map((notif) => (
              <div key={notif._id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                {editingId === notif._id ? (
                  // Edit mode
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                      placeholder="Title"
                    />
                    <textarea
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                      className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                      placeholder="Message"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSave(notif._id)}
                        disabled={loading}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-semibold disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">{notif.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                      </div>
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={() => handleEditStart(notif)}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(notif._id)}
                          className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                      <span>
                        {notif.isPublic ? '🌍 Public' : `👤 Private to ${notif.user?.firstName || 'User'}`}
                      </span>
                      <span>{new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SendNotice;
