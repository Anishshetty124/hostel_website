import React, { useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import { Search, CheckCircle2, AlertCircle, Clock, MessageCircle, Send, X } from 'lucide-react';
import { ComplaintCardSkeleton, StatsCardsSkeleton } from '../../components/SkeletonLoaders';
import { io } from 'socket.io-client';

const statusOptions = ['Pending', 'In Progress', 'Resolved'];

const AdminComplaints = () => {
    // Delete complaint handler
    const handleDeleteComplaint = async (id) => {
      if (!token) return;
      if (!window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) return;
      setUpdatingId(id);
      try {
        await api.delete(`/complaints/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setList((prev) => prev.filter((c) => c._id !== id));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete complaint');
      } finally {
        setUpdatingId(null);
      }
    };
  const { token } = useContext(AuthContext);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const abortControllerRef = useRef(null);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    
    // Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/complaints/admin/all', {
        headers: { Authorization: `Bearer ${token}` },
        signal: abortControllerRef.current.signal
      });
      setList(res.data || []);
    } catch (err) {
      // Ignore abort/cancel errors (axios uses 'CanceledError')
      if (err.name === 'AbortError' || err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
      setError(err.response?.data?.message || 'Failed to load complaints');
      // Error fetching complaints handled
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAll();
    return () => {
      // Cleanup: abort request on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchAll]);

  // Socket.io connection for real-time updates
  useEffect(() => {
    const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Admin socket connected');
    });

    // Listen for new complaints
    socket.on('complaint:created', (newComplaint) => {
      setList((prev) => [newComplaint, ...prev]);
    });

    // Listen for complaint updates (replies, status changes)
    socket.on('complaint:updated', (updatedComplaint) => {
      setList((prev) =>
        prev.map((c) =>
          c._id === updatedComplaint._id ? updatedComplaint : c
        )
      );
    });

    // Listen for complaint deletions
    socket.on('complaint:deleted', (deletedId) => {
      setList((prev) => prev.filter((c) => c._id !== deletedId));
    });

    socket.on('disconnect', () => {
      console.log('Admin socket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const filtered = useMemo(() => {
    let data = list;
    if (statusFilter !== 'all') {
      data = data.filter((c) => c.status === (statusFilter === 'pending' ? 'Pending' : 'Resolved'));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter((c) =>
        c.title?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.roomNumber?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q)
      );
    }
    return data;
  }, [list, statusFilter, search]);

  const updateStatus = async (id, status) => {
    if (!token) return;
    setUpdatingId(id);
    try {
      const res = await api.patch(`/complaints/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setList((prev) => prev.map((c) => (c._id === id ? res.data : c)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const sendReply = async (id) => {
    if (!token || !replyText.trim()) return;
    setUpdatingId(id);
    try {
      const res = await api.post(`/complaints/${id}/reply`, { message: replyText.trim() }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setList((prev) => prev.map((c) => (c._id === id ? res.data : c)));
      setReplyText('');
      setReplyingId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reply');
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = useMemo(() => {
    const active = list.filter((c) => c.status !== 'Resolved').length;
    const resolved = list.filter((c) => c.status === 'Resolved').length;
    const urgent = list.filter((c) => c.urgency === 'High' && c.status !== 'Resolved').length;
    return [
      { label: 'Active', count: active, icon: <Clock size={18} />, color: 'text-amber-500 bg-amber-50' },
      { label: 'Resolved', count: resolved, icon: <CheckCircle2 size={18} />, color: 'text-emerald-500 bg-emerald-50' },
      { label: 'Urgent', count: urgent, icon: <AlertCircle size={18} />, color: 'text-rose-500 bg-rose-50' },
    ];
  }, [list]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      {error && <div className="text-center text-red-500 font-semibold mb-4">{error}</div>}
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8 lg:py-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Admin • Complaints</p>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">All Requests</h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="bg-white/70 dark:bg-gray-900/70 backdrop-blur border border-white dark:border-gray-800 p-4 rounded-2xl shadow-sm flex items-center gap-3">
                <div className={`p-3 rounded-xl ${s.color}`}>{s.icon}</div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-gray-400">{s.label}</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-gray-100">{s.count}</p>
                </div>
              </div>
            ))}
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by issue, room, or category"
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500"
            />
          </div>
          <div className="flex bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-800 p-1.5 rounded-2xl shadow-sm">
            {['all', 'pending', 'resolved'].map((t) => (
              <button
                key={t}
                onClick={() => setStatusFilter(t)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${statusFilter === t ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <>
              {[...Array(3)].map((_, i) => (
                <ComplaintCardSkeleton key={i} />
              ))}
            </>
          ) : filtered.length === 0 ? (
            <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm text-slate-500 dark:text-gray-300">No complaints found.</div>
          ) : (
            filtered.map((c) => (
              <div key={c._id} className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-gray-100 mb-1">{c.title}</h3>
                      <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">📧 {c.user?.firstName} {c.user?.lastName} ({c.user?.email})</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-200">{c.urgency || 'Medium'}</span>
                      <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-200">{c.category || 'Other'}</span>
                      <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-slate-50 dark:bg-gray-800 text-slate-500 dark:text-gray-300">Room {c.roomNumber}</span>
                      <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-gray-300 mb-3">{c.description}</p>
                    {c.images?.length > 0 && (
                      <div className="mt-3 mb-3">
                        <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-2">📷 Images ({c.images.length})</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {c.images.map((img, idx) => {
                            // Handle both object format {mediaUrl, type, ...} and string URL (legacy)
                            const imageUrl = typeof img === 'string' ? img : img.mediaUrl;
                            return (
                              <AdminImageWithLoader key={idx} src={imageUrl} alt={`Complaint image ${idx + 1}`} />
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {c.replies?.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {c.replies.map((r, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm bg-slate-50 dark:bg-gray-800 rounded-xl p-3">
                            <MessageCircle size={16} className="text-indigo-500" />
                            <div>
                              <p className="text-slate-800 dark:text-gray-100 font-semibold">{r.message}</p>
                              <p className="text-xs text-slate-400 dark:text-gray-500">{r.role || 'Admin'} • {timeAgo(r.createdAt)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="w-full md:w-64 space-y-3">
                    <div className="bg-slate-50 dark:bg-gray-800 rounded-xl p-3">
                      <p className="text-xs font-bold text-slate-500 dark:text-gray-300 uppercase tracking-widest mb-2">Status</p>
                      <select
                        value={c.status}
                        onChange={(e) => updateStatus(c._id, e.target.value)}
                        disabled={updatingId === c._id}
                        className="w-full bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-gray-100"
                      >
                        {statusOptions.map((s) => (
                          <option key={s} className="bg-white text-slate-900">{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-slate-50 dark:bg-gray-800 rounded-xl p-3">
                      <p className="text-xs font-bold text-slate-500 dark:text-gray-300 uppercase tracking-widest mb-2">Reply</p>
                      {replyingId === c._id ? (
                        <div className="space-y-2">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={3}
                            className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-gray-100"
                            placeholder="Type your message"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => sendReply(c._id)}
                              disabled={updatingId === c._id}
                              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-lg px-3 py-2 text-sm font-semibold hover:bg-indigo-700"
                            >
                              <Send size={16} /> Send
                            </button>
                            <button
                              type="button"
                              onClick={() => { setReplyingId(null); setReplyText(''); }}
                              className="px-3 py-2 text-sm text-slate-500 dark:text-gray-300 hover:text-slate-700 dark:hover:text-gray-100"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setReplyingId(c._id); setReplyText(''); }}
                          className="w-full text-sm font-semibold text-indigo-600 dark:text-indigo-300 hover:text-indigo-800"
                        >
                          Add reply
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Delete button for resolved complaints */}
                  {c.status === 'Resolved' && (
                    <div className="w-full md:w-64">
                      <button
                        type="button"
                        onClick={() => handleDeleteComplaint(c._id)}
                        className="w-full flex items-center justify-center gap-2 bg-rose-600 text-white rounded-lg px-3 py-2 text-sm font-semibold hover:bg-rose-700 mt-2"
                        disabled={updatingId === c._id}
                      >
                        Delete Complaint
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};




// Simple time-ago helper
const timeAgo = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
};

// Image component with loading state for admin
const AdminImageWithLoader = ({ src, alt }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <a href={src} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border border-slate-200 dark:border-gray-700 hover:shadow-md transition-shadow relative">
      {isLoading && (
        <div className="absolute inset-0 w-full h-20 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 animate-pulse z-10">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[9px] text-gray-600 dark:text-gray-400 font-medium mt-1">Loading...</span>
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 w-full h-20 flex items-center justify-center bg-red-50 dark:bg-red-900/20 z-10">
          <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold">Failed</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className="w-full h-20 object-cover hover:scale-105 transition-transform"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s' }}
      />
    </a>
  );
};

export default AdminComplaints;
