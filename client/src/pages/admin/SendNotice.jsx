import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

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
  const suggestionsRef = useRef(null);
  // Fetch all users for suggestions (admin only)
  useEffect(() => {
    if (type === 'private') {
      const token = localStorage.getItem('token');
      api.get('/api/auth/users/all', token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
        .then(res => setAllUsers(res.data || []))
        .catch(() => setAllUsers([]));
    }
  }, [type]);

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
      await api.post(
        '/api/notifications/send',
        { type, recipient, title, message },
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );
      setStatus('Notification sent successfully!');
      setTitle('');
      setMessage('');
      setRecipient('');
    } catch (err) {
      setStatus('Failed to send notification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow p-6 mt-8">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Send Notice / Message</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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
        {status && <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">{status}</div>}
      </form>
    </div>
  );
};

export default SendNotice;
