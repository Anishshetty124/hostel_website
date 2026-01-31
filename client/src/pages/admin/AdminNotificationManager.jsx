import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function AdminNotificationManager() {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    // Fetch current creative notification status and schedule
    api.get('/api/notifications/creative/settings')
      .then(res => {
        setEnabled(res.data.enabled);
        setSchedules(res.data.schedules || []);
      })
      .catch(() => setEnabled(true));
  }, []);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await api.post('/api/notifications/creative/settings', { enabled: !enabled });
      setEnabled(!enabled);
      setStatus('Settings updated!');
    } catch {
      setStatus('Failed to update.');
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(''), 2000);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow p-6 mt-8">
      {status && <div className={`mb-4 text-center font-semibold ${status.includes('fail') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{status}</div>}
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Creative Notifications Manager</h1>
      <div className="mb-4">
        <label className="font-semibold">Enable creative notifications for all users:</label>
        <button
          className={`ml-4 px-4 py-2 rounded ${enabled ? 'bg-green-600' : 'bg-gray-400'} text-white font-semibold`}
          onClick={handleToggle}
          disabled={loading}
        >
          {enabled ? 'ON' : 'OFF'}
        </button>
      </div>
      <div>
        <h2 className="font-semibold mb-2">Current Notification Schedules</h2>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-200">
          {schedules.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>
      <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
        (For advanced schedule/message editing, contact your developer.)
      </div>
    </div>
  );
}
