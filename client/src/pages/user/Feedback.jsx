import React, { useContext, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const Feedback = () => {
    const { token, user } = useContext(AuthContext);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!subject.trim() || !message.trim()) {
            setError('Please fill in subject and message.');
            return;
        }
        if (!token) {
            setError('Please login to send feedback.');
            return;
        }
        setLoading(true);
        try {
            await axios.post('/api/feedback', { subject: subject.trim(), message: message.trim() }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess('Thanks! Your feedback has been sent.');
            setSubject('');
            setMessage('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send feedback.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6 sm:p-8 space-y-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-gray-100">Share Your Feedback</h1>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 mt-1">We read every message. Your note will be emailed to admin and our support inbox.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wide">Name</label>
                            <input
                                type="text"
                                value={user?.firstName ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` : ''}
                                disabled
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-slate-900 dark:text-gray-100"
                                placeholder="Your name"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wide">Email</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-slate-900 dark:text-gray-100"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wide">Subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-slate-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Let us know how we can improve"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wide">Message</label>
                        <textarea
                            rows="5"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-slate-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                            placeholder="Share details, suggestions, or issues..."
                        />
                    </div>

                    {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
                    {success && <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending...' : 'Send Feedback'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Feedback;
