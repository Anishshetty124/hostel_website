import React, { useEffect, useMemo, useState, useContext, useRef, useCallback } from 'react';
import api from '../../utils/api';
import {
    Plus, Search, Wrench, Zap,
    Trash2, Coffee, Clock, X,
    CheckCircle2, AlertCircle, MessageCircle, RefreshCw, Download
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { StatsCardsSkeleton, ComplaintCardSkeleton } from '../../components/SkeletonLoaders';
import { getSocket } from '../../utils/socket';
import { motion, AnimatePresence } from 'framer-motion';
 
const categoryOptions = ['Electrical', 'Plumbing', 'Cleaning', 'Other'];
const urgencyOptions = ['Low', 'Medium', 'High'];

const Complaints = () => {
    const { token } = useContext(AuthContext);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        roomNumber: '',
        category: 'Electrical',
        urgency: 'Medium',
    });
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreview, setImagePreview] = useState([]);
    const [lightboxImage, setLightboxImage] = useState(null); // For image lightbox

    const cacheRef = useRef(null);
    const abortControllerRef = useRef(null);
    const fileInputRef = useRef(null);

    const fetchComplaints = useCallback(async () => {
        if (!token) return;
        
        // Cancel previous request if any
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        
        setLoading(true);
        setError(null);
        try {
            // Serve cached if available to avoid extra loading
            if (cacheRef.current) {
                setComplaints(cacheRef.current);
                setLoading(false);
                return;
            }
            const res = await api.get('/complaints', {
                headers: { Authorization: `Bearer ${token}` },
                signal: abortControllerRef.current.signal
            });
            setComplaints(res.data || []);
            cacheRef.current = res.data || [];
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
        fetchComplaints();
        
        // Request notification permission when component mounts
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        return () => {
            // Cleanup: abort request on unmount
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchComplaints]);

    // Socket.io connection for real-time updates
    useEffect(() => {
        const socket = getSocket();

        const handleConnect = () => {
            console.log('Socket connected');
        };

        const handleCreated = (newComplaint) => {
            setComplaints((prev) => {
                const updated = [newComplaint, ...prev];
                cacheRef.current = updated;
                return updated;
            });
        };

        const handleUpdated = (updatedComplaint) => {
            setComplaints((prev) => {
                const updated = prev.map((c) =>
                    c._id === updatedComplaint._id ? updatedComplaint : c
                );
                cacheRef.current = updated;
                return updated;
            });
        };

        const handleDeleted = (deletedId) => {
            setComplaints((prev) => {
                const updated = prev.filter((c) => c._id !== deletedId);
                cacheRef.current = updated;
                return updated;
            });
        };

        const handleDisconnect = () => {
            console.log('Socket disconnected');
        };

        socket.on('connect', handleConnect);
        socket.on('complaint:created', handleCreated);
        socket.on('complaint:updated', handleUpdated);
        socket.on('complaint:deleted', handleDeleted);
        socket.on('disconnect', handleDisconnect);

        return () => {
            socket.off('connect', handleConnect);
            socket.off('complaint:created', handleCreated);
            socket.off('complaint:updated', handleUpdated);
            socket.off('complaint:deleted', handleDeleted);
            socket.off('disconnect', handleDisconnect);
        };
    }, []);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length + selectedImages.length > 5) {
            setError('Maximum 5 images allowed');
            return;
        }
        setSelectedImages([...selectedImages, ...files]);
        // Create preview URLs
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(prev => [...prev, event.target.result]);
            };
            reader.readAsDataURL(file);
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveImage = (index) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreview(prev => prev.filter((_, i) => i !== index));
    };

    const uploadImagesToImageKit = async (files) => {
        const uploadedUrls = [];
        for (const file of files) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                const res = await api.post('/complaints/upload', formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                uploadedUrls.push(res.data.url || res.data.mediaUrl);
            } catch (err) {
                console.error('Image upload failed:', err);
            }
        }
        return uploadedUrls;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) return setError('Please login to submit complaints');
        setSubmitting(true);
        setError(null);
        try {
            // Submit complaint immediately without waiting for image uploads
            const res = await api.post('/complaints', 
                { ...formData, images: [] },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const newList = [res.data, ...complaints];
            setComplaints(newList);
            cacheRef.current = newList;
            setIsFormOpen(false);
            setFormData({ title: '', description: '', roomNumber: '', category: 'Electrical', urgency: 'Medium' });
            setSelectedImages([]);
            setImagePreview([]);
            
            // Upload images in background without blocking
            if (selectedImages.length > 0) {
                uploadImagesToImageKit(selectedImages)
                    .then((imageUrls) => {
                        if (imageUrls && imageUrls.length > 0) {
                            return api.patch(`/complaints/${res.data._id}`, 
                                { images: imageUrls },
                                { headers: { Authorization: `Bearer ${token}` } }
                            );
                        }
                    })
                    .catch(err => {
                        console.error('Failed to attach images:', err);
                    });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit');
        } finally {
            setSubmitting(false);
        }
    };

    // Derived stats and filtered list
    const { stats, filtered } = useMemo(() => {
        const active = complaints.filter((c) => c.status !== 'Resolved').length;
        const resolved = complaints.filter((c) => c.status === 'Resolved').length;
        const urgent = complaints.filter((c) => c.urgency === 'High' && c.status !== 'Resolved').length;

        let list = [...complaints];
        if (filter === 'pending') list = list.filter((c) => c.status !== 'Resolved');
        if (filter === 'resolved') list = list.filter((c) => c.status === 'Resolved');

        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter((c) =>
                c.title?.toLowerCase().includes(q) ||
                c.description?.toLowerCase().includes(q) ||
                c.roomNumber?.toLowerCase().includes(q) ||
                c.category?.toLowerCase().includes(q)
            );
        }

        if (list.length > 1) {
            list.sort((a, b) => {
                if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
                if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
                if (sortBy === 'urgency') {
                    const order = { High: 0, Medium: 1, Low: 2 };
                    return (order[a.urgency] ?? 3) - (order[b.urgency] ?? 3);
                }
                if (sortBy === 'status') {
                    const order = { Pending: 0, 'In Progress': 1, Resolved: 2 };
                    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
                }
                return 0;
            });
        }

        return {
            stats: [
                { label: 'Active', count: active, icon: <Clock size={20} />, color: 'text-amber-500 bg-amber-50' },
                { label: 'Resolved', count: resolved, icon: <CheckCircle2 size={20} />, color: 'text-emerald-500 bg-emerald-50' },
                { label: 'Urgent', count: urgent, icon: <AlertCircle size={20} />, color: 'text-rose-500 bg-rose-50' },
            ],
            filtered: list,
        };
    }, [complaints, filter, search, sortBy]);

    const statusColors = {
        Pending: 'bg-amber-100 text-amber-700',
        'In Progress': 'bg-indigo-100 text-indigo-700',
        Resolved: 'bg-emerald-100 text-emerald-700 opacity-60',
    };

    const categoryIcons = {
        Electrical: <Zap size={20} />,
        Plumbing: <Wrench size={20} />,
        Cleaning: <Trash2 size={20} />,
        Other: <Coffee size={20} />,
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 font-sans text-slate-900 dark:text-gray-100 pb-10">
            {/* HEADER */}
            <header className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 pt-4 pb-8 md:pt-12 md:pb-16 px-3 md:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col gap-4 md:gap-8">
                        <div className="relative">
                            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-900 dark:text-gray-100 uppercase leading-none">
                                Maintenance <span className="text-indigo-600 dark:text-indigo-400">Requests</span>
                            </h1>
                            <div className="absolute -bottom-2 left-0 h-1 w-16 md:h-1.5 md:w-32 bg-indigo-600 dark:bg-indigo-500 rounded-full"></div>
                        </div>

                        <div className="flex gap-2 md:gap-4">
                            <button
                                onClick={() => setIsFormOpen(true)}
                                className="group relative inline-flex items-center justify-center flex-1 px-4 md:px-8 py-2.5 md:py-4 font-bold text-sm md:text-base text-white bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-700 rounded-lg md:rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                <Plus size={18} className="mr-1.5 md:mr-2" />
                                New Request
                            </button>

                            <button
                                onClick={fetchComplaints}
                                disabled={loading}
                                className="group relative inline-flex items-center justify-center px-3 md:px-6 py-2.5 md:py-4 font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg md:rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                                title="Refresh to see new replies"
                            >
                                <RefreshCw size={18} className={`${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 -mt-6 md:-mt-8">
                {/* ERROR ALERT */}
                {error && (
                    <div className="mb-6 p-4 md:p-5 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 rounded-xl md:rounded-2xl text-sm font-medium">
                        {error}
                    </div>
                )}

                {/* STATS CARDS - Show skeleton while loading */}
                {loading ? (
                    <StatsCardsSkeleton />
                ) : (
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-6 mb-6 md:mb-12">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="group relative bg-white dark:bg-gray-800 rounded-xl md:rounded-3xl p-0.5 md:p-1 shadow-lg shadow-gray-300/60 dark:shadow-black/10 transition-all hover:shadow-xl">
                                <div className={`h-full rounded-lg md:rounded-[2.6rem] p-2 sm:p-4 md:p-7 bg-gradient-to-br ${stat.color} border border-gray-200 dark:border-transparent`}>
                                    <p className="text-[10px] sm:text-xs md:text-sm font-bold uppercase text-slate-700 dark:text-gray-400 tracking-wide mb-1 md:mb-2">{stat.label}</p>
                                    <p className="text-lg sm:text-2xl md:text-4xl font-black text-slate-900 dark:text-gray-100">{stat.count}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* SEARCH & FILTER */}
                <div className="flex flex-col gap-2 md:gap-4 mb-6 md:mb-10">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" size={18} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search complaints..."
                            className="w-full pl-10 pr-3 py-2.5 md:py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg md:rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm md:text-base text-slate-900 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 shadow-sm"
                        />
                    </div>
                    <div className="flex gap-2 md:gap-3">
                        <div className="flex flex-1 bg-white dark:bg-gray-800 p-0.5 md:p-1 rounded-lg md:rounded-xl border border-gray-300 dark:border-gray-700 gap-0.5 md:gap-1 shadow-sm">
                            {['all', 'pending', 'resolved'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setFilter(t)}
                                    className={`flex-1 px-2 sm:px-3 md:px-6 py-1.5 md:py-2.5 rounded-md md:rounded-lg text-[11px] sm:text-xs md:text-sm font-bold capitalize transition-all duration-300 ${
                                        filter === t
                                            ? 'bg-indigo-600 text-white shadow-lg'
                                            : 'text-slate-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        {complaints.length > 1 && (
                            <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl border border-gray-300 dark:border-gray-700 shadow-sm">
                                <span className="text-[10px] md:text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wide whitespace-nowrap">Sort</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="text-[11px] md:text-sm font-semibold bg-white dark:bg-gray-700 text-slate-800 dark:text-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-1"
                                >
                                    <option value="newest" className="bg-white text-slate-900">Newest</option>
                                    <option value="oldest" className="bg-white text-slate-900">Oldest</option>
                                    <option value="urgency" className="bg-white text-slate-900">Urgency</option>
                                    <option value="status" className="bg-white text-slate-900">Status</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* COMPLAINTS LIST */}
                <div className="space-y-4 md:space-y-6">
                    {loading ? (
                        <>
                            {[...Array(3)].map((_, i) => (
                                <ComplaintCardSkeleton key={i} />
                            ))}
                        </>
                    ) : filtered.length === 0 ? (
                        <div className="p-8 md:p-12 bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl border border-gray-300 dark:border-gray-700 text-center shadow-lg">
                            <p className="text-slate-600 dark:text-gray-400 text-lg font-medium">No complaints yet.</p>
                        </div>
                    ) : (
                        filtered.map((c) => (
                            <ComplaintCard
                                key={c._id}
                                complaint={c}
                                onComplaintUpdate={(updatedC) => setComplaints(prev => prev.map(x => x._id === updatedC._id ? updatedC : x))}
                                onComplaintDelete={(id) => setComplaints(prev => prev.filter(x => x._id !== id))}
                                onImageClick={setLightboxImage}
                            />
                        ))
                    )}
                </div>
            </main>

            {/* FORM MODAL */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm">
                    <div
                        className="absolute inset-0"
                        onClick={() => setIsFormOpen(false)}
                    />
                    <div className="relative w-full md:max-w-xl bg-white dark:bg-gray-800 md:rounded-3xl shadow-2xl p-4 md:p-8 flex flex-col max-h-[95vh] md:max-h-[90vh] overflow-y-auto rounded-t-2xl md:rounded-t-3xl">
                        <div className="flex justify-between items-center mb-6 md:mb-8 sticky top-0 bg-white dark:bg-gray-800 -mx-4 -mt-4 md:-mx-8 md:-mt-8 px-4 md:px-8 py-4 md:py-6 border-b border-gray-200 dark:border-gray-700 z-10">
                            <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-gray-100 tracking-tight">New Request</h2>
                            <button
                                onClick={() => setIsFormOpen(false)}
                                className="p-1.5 md:p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-slate-400 dark:text-gray-500"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <form className="space-y-3 md:space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <label className="text-xs md:text-sm font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wide">Title</label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleFormChange}
                                    className="w-full p-3 md:p-4 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500"
                                    placeholder="e.g. Light flickering"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs md:text-sm font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wide">Room</label>
                                    <input
                                        name="roomNumber"
                                        value={formData.roomNumber}
                                        onChange={handleFormChange}
                                        className="w-full p-3 md:p-4 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-900 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500"
                                        placeholder="101"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs md:text-sm font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wide">Urgency</label>
                                    <select
                                        name="urgency"
                                        value={formData.urgency}
                                        onChange={handleFormChange}
                                        className="w-full p-3 md:p-4 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none text-slate-900 dark:text-gray-100 cursor-pointer"
                                    >
                                        {urgencyOptions.map((u) => (
                                            <option key={u} value={u}>{u}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs md:text-sm font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wide">Category</label>
                                <div className="grid grid-cols-2 gap-2 md:gap-3">
                                    {categoryOptions.map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setFormData((prev) => ({ ...prev, category: cat }))}
                                            className={`p-3 md:p-4 border rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all ${
                                                formData.category === cat
                                                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                                    : 'border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-600 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-500'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs md:text-sm font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wide">Description</label>
                                <textarea
                                    name="description"
                                    rows="4"
                                    value={formData.description}
                                    onChange={handleFormChange}
                                    className="w-full p-3 md:p-4 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-slate-900 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500"
                                    placeholder="Describe the issue..."
                                    required
                                ></textarea>
                            </div>

                            {/* Image Upload Section */}
                            <div className="space-y-2">
                                <label className="text-xs md:text-sm font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wide">📸 Attach Images (Optional, Max 5)</label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full p-3 md:p-4 border-2 border-dashed border-indigo-300 dark:border-indigo-600 rounded-xl md:rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                                >
                                    Click to upload images or drag & drop
                                </button>
                                {imagePreview.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2 md:gap-3">
                                        {imagePreview.map((preview, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border-2 border-indigo-300 dark:border-indigo-600">
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(idx)}
                                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 transition-colors text-sm font-bold"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <p className="text-xs text-slate-500 dark:text-gray-400">
                                    {selectedImages.length}/5 images selected
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full py-3 md:py-4 text-white font-bold text-base md:text-lg rounded-xl md:rounded-2xl transition-all ${
                                    submitting
                                        ? 'bg-indigo-400 dark:bg-indigo-700 cursor-not-allowed'
                                        : 'bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-700 active:scale-[0.98]'
                                }`}
                            >
                                {submitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Image Lightbox */}
            {lightboxImage && (
                <ImageLightbox 
                    imageUrl={lightboxImage} 
                    onClose={() => setLightboxImage(null)} 
                />
            )}
        </div>
    );
};

const ComplaintCard = React.memo(({ complaint, onComplaintUpdate, onComplaintDelete, onImageClick }) => {
    const [replyText, setReplyText] = useState('');
    const [replying, setReplying] = useState(false);
    const [error, setError] = useState(null);
    const [longPressReplyId, setLongPressReplyId] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deletingComplaint, setDeletingComplaint] = useState(false);
    const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
    const longPressTimer = useRef(null);
    const scrollContainerRef = useRef(null);
    const { token, user } = useContext(AuthContext);
    
    // Memoize icons and styles to prevent re-creation on every render
    const categoryIcons = useMemo(() => ({
        Electrical: <Zap size={20} />,
        Plumbing: <Wrench size={20} />,
        Cleaning: <Trash2 size={20} />,
        Other: <Coffee size={20} />,
    }), []);

    const statusStyles = useMemo(() => ({
        Pending: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400',
        'In Progress': 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400',
        Resolved: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 opacity-75',
    }), []);

    const urgencyStyles = useMemo(() => ({
        High: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
        Medium: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        Low: 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-gray-600',
    }), []);

    const timeAgo = useCallback((date) => {
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
    }, []);

    const sendReply = useCallback(async () => {
        if (!token || !replyText.trim()) return;
        
        const optimisticReply = {
            message: replyText.trim(),
            by: { firstName: 'You', role: 'user' },
            createdAt: new Date(),
            _id: 'temp-' + Date.now()
        };

        // Show message immediately (optimistic update)
        const updatedComplaint = {
            ...complaint,
            replies: [...(complaint.replies || []), optimisticReply]
        };
        onComplaintUpdate(updatedComplaint);
        setReplyText('');
        setReplying(true);

        // Send to server
        try {
            const res = await api.post(`/complaints/${complaint._id}/user-reply`, { message: optimisticReply.message }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Update with server response (to get real _id and timestamps)
            onComplaintUpdate(res.data);
        } catch (err) {
            // Failed to send reply handled
            // Revert optimistic update on error
            onComplaintUpdate(complaint);
            setError(err.response?.data?.message || 'Failed to send reply');
            setTimeout(() => setError(null), 3000);
        } finally {
            setReplying(false);
        }
    }, [token, replyText, complaint, onComplaintUpdate]);

    const handleLongPressStart = useCallback((replyId) => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
        longPressTimer.current = setTimeout(() => {
            setLongPressReplyId(replyId);
        }, 250); // faster 250ms long press
    }, []);

    const handleLongPressEnd = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
    }, []);

    const handleScroll = useCallback((e) => {
        const element = e.target;
        const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 10;
        setIsScrolledToBottom(isAtBottom);
    }, []);

    const deleteReply = useCallback(async (replyId) => {
        if (!token) return;
        
        setDeleting(true);

        try {
            const res = await api.delete(`/complaints/${complaint._id}/reply/${replyId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            onComplaintUpdate(res.data);
            setLongPressReplyId(null);
        } catch (err) {
            // Failed to delete reply handled
            setError(err.response?.data?.message || 'Failed to delete reply');
            setTimeout(() => setError(null), 3000);
        } finally {
            setDeleting(false);
        }
    }, [token, complaint, onComplaintUpdate]);

    const deleteComplaint = useCallback(async () => {
        if (!token || deletingComplaint) return;
        const confirmed = window.confirm('Delete this complaint? This action cannot be undone.');
        if (!confirmed) return;

        setDeletingComplaint(true);
        try {
            await api.delete(`/complaints/${complaint._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            onComplaintDelete?.(complaint._id);
        } catch (err) {
            // Failed to delete complaint handled
            setError(err.response?.data?.message || 'Failed to delete complaint');
            setTimeout(() => setError(null), 3000);
        } finally {
            setDeletingComplaint(false);
        }
    }, [token, deletingComplaint, complaint._id, onComplaintDelete]);

    return (
        <div className="group relative bg-white dark:bg-gray-800 rounded-xl md:rounded-3xl p-1 shadow-lg shadow-gray-300/60 dark:shadow-black/10 transition-all hover:shadow-xl">
            <div className="h-full rounded-lg md:rounded-[2.6rem] p-3 sm:p-5 md:p-7 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 space-y-3 sm:space-y-4 md:space-y-5">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                    <div className="flex items-start gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                        <div className="p-2 sm:p-3 md:p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg md:rounded-xl text-indigo-600 dark:text-indigo-400 flex-shrink-0 text-sm sm:text-base">
                            {categoryIcons[complaint.category] || <Coffee size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-gray-100 truncate">
                                {complaint.title}
                            </h3>
                            <p className="text-xs md:text-sm text-slate-500 dark:text-gray-400 mt-0.5">{complaint.category}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={deleteComplaint}
                            disabled={deletingComplaint}
                            className="flex items-center gap-1 px-3 py-2 text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Trash2 size={14} />
                            {deletingComplaint ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>

                {/* Status & Urgency Badges */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-lg border ${statusStyles[complaint.status] || statusStyles.Pending}`}>
                        {complaint.status || 'Pending'}
                    </span>
                    <span className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-lg border ${urgencyStyles[complaint.urgency] || urgencyStyles.Medium}`}>
                        {complaint.urgency}
                    </span>
                </div>

                {/* Description */}
                {complaint.description && (
                    <div className="bg-gray-100 dark:bg-gray-700 p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-transparent">
                        <p className="text-xs sm:text-sm md:text-base text-slate-900 dark:text-gray-100 font-semibold mb-1">Your Issue:</p>
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 break-words">
                            {complaint.description}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-gray-500 mt-2">Room {complaint.roomNumber} • {timeAgo(complaint.createdAt)}</p>
                    </div>
                )}

                {/* Attached Images */}
                {complaint.images && complaint.images.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-gray-300">📸 Attached Images:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {complaint.images.map((img, idx) => {
                                // Handle both object format {mediaUrl, type, ...} and string URL (legacy)
                                const imageUrl = typeof img === 'string' ? img : img.mediaUrl;
                                return (
                                    <ImageWithLoader
                                        key={idx}
                                        src={imageUrl}
                                        alt={`Complaint image ${idx + 1}`}
                                        className="aspect-square rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 hover:shadow-lg transition-shadow"
                                        onClick={() => onImageClick(imageUrl)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Message Thread */}
                <div className="space-y-2 sm:space-y-3 border-t border-slate-200 dark:border-gray-700 pt-3 sm:pt-4">
                    {complaint.replies?.length > 0 ? (
                        <div className="space-y-2 sm:space-y-3">
                            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Conversation</p>
                            <div className="relative">
                                <div 
                                    ref={scrollContainerRef}
                                    onScroll={handleScroll}
                                    onClick={() => setLongPressReplyId(null)}
                                    className="space-y-2 sm:space-y-3 max-h-[400px] overflow-y-auto px-2 sm:px-0 pb-4 scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 scrollbar-track-gray-100 dark:scrollbar-track-gray-800/50 rounded max-w-4xl mx-auto"
                                >
                                    {complaint.replies.map((reply, idx) => (
                                        <div 
                                            key={idx} 
                                            className={`relative border rounded-lg p-2 sm:p-3 space-y-2 transition-all min-w-0 shadow-sm ${
                                                reply.role === 'user' || reply.role === 'You' 
                                                    ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-800' 
                                                    : 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-800'
                                            } ${longPressReplyId === reply._id ? 'ring-2 ring-offset-2 ring-red-500 ring-offset-white dark:ring-offset-gray-800' : ''}`}
                                            onMouseDown={() => handleLongPressStart(reply._id)}
                                            onMouseUp={handleLongPressEnd}
                                            onMouseLeave={handleLongPressEnd}
                                            onTouchStart={() => handleLongPressStart(reply._id)}
                                            onTouchEnd={handleLongPressEnd}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 min-w-0">
                                                <p className={`text-xs font-bold flex-shrink-0 ${reply.role === 'user' || reply.role === 'You' ? 'text-blue-700 dark:text-blue-300' : 'text-indigo-700 dark:text-indigo-300'}`}>
                                                    {reply.role === 'user' || reply.role === 'You' ? 'Your Reply' : 'Admin Reply'}
                                                </p>
                                                {longPressReplyId === reply._id && (reply.role === 'user' || reply.role === 'You') && (
                                                    <button
                                                        onClick={() => deleteReply(reply._id)}
                                                        disabled={deleting}
                                                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs font-semibold px-2 py-1 bg-red-50 dark:bg-red-900/30 rounded hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 flex-shrink-0"
                                                    >
                                                        {deleting && (
                                                            <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                        )}
                                                        {deleting ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-900 dark:text-gray-100 break-words overflow-hidden">{reply.message}</p>
                                            <p className="text-xs text-slate-500 dark:text-gray-400">{timeAgo(reply.createdAt)}</p>
                                        </div>
                                    ))}
                                </div>
                                {/* Scroll indicator - visible when there are many messages and not scrolled to bottom */}
                                {complaint.replies.length > 3 && !isScrolledToBottom && (
                                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none flex items-end justify-center pb-1">
                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 animate-bounce">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 dark:text-gray-500 italic">No replies yet. Admin will respond soon.</p>
                    )}

                    {/* Reply Input */}
                    <div className="mt-2 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-300 dark:border-gray-700">
                        <p className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wide mb-2">Your Reply:</p>
                        {error && <p className="text-xs text-rose-600 dark:text-rose-400 mb-2">{error}</p>}
                        <div className="space-y-2">
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Type your message..."
                                rows="2"
                                className="w-full p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-900 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 text-xs sm:text-sm"
                            />
                            <button
                                onClick={sendReply}
                                disabled={!replyText.trim() || replying}
                                className="w-full px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-xs sm:text-sm hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {replying ? 'Sending...' : 'Send Reply'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

// Lightbox Modal for Images
const ImageLightbox = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="w-full max-w-5xl h-auto max-h-[95vh] flex items-center justify-center relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        className="absolute top-2 right-2 text-white text-4xl font-thin hover:rotate-90 transition-transform bg-black/40 rounded-full px-3 py-1 z-50"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        &times;
                    </button>
                    <button
                        className="absolute bottom-4 right-4 text-white text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 rounded-full px-6 py-3 z-50 flex items-center gap-2 shadow-lg transition-all hover:scale-105"
                        onClick={async () => {
                            try {
                                const response = await fetch(imageUrl);
                                const blob = await response.blob();
                                const blobUrl = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = blobUrl;
                                link.download = 'complaint-image';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(blobUrl);
                            } catch (err) {
                                window.open(imageUrl, '_blank');
                            }
                        }}
                        aria-label="Download"
                    >
                        <Download size={18} />
                        Download
                    </button>
                    <img
                        src={imageUrl}
                        alt="Complaint"
                        className="w-full h-full object-contain rounded-lg"
                    />
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// Image component with loading state
const ImageWithLoader = ({ src, alt, className, onClick }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    return (
        <div
            onClick={onClick}
            className={`${className} cursor-pointer relative`}
        >
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 animate-pulse z-10">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Loading...</span>
                    </div>
                </div>
            )}
            {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20 z-10">
                    <span className="text-xs text-red-600 dark:text-red-400 font-semibold">Failed to load</span>
                </div>
            )}
            <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover hover:scale-110 transition-transform"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setIsLoading(false);
                    setHasError(true);
                }}
                style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s' }}
            />
        </div>
    );
};

export default Complaints;