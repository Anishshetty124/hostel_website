import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ChevronDown } from 'lucide-react';

const tabs = ['All', 'Photos', 'Videos', 'Rooms', 'Mess', 'Events'];
const ITEMS_PER_PAGE = 6;
const PREVIEW_ITEMS = 4; // Items to show in "All" preview

const Gallery = () => {
    const navigate = useNavigate();
    const { user, token } = useContext(AuthContext);
    const [media, setMedia] = useState([]);
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(null); // Track which item is being deleted
    const fileInputRef = useRef(null);
    const uploadSectionRef = useRef(null);
    const [newTitle, setNewTitle] = useState('');
    const [newCategory, setNewCategory] = useState('Hostel');
    const [customCategory, setCustomCategory] = useState('');
    const [selectedFileName, setSelectedFileName] = useState('');
    const [showUploadSection, setShowUploadSection] = useState(false);
    const [displayedPhotos, setDisplayedPhotos] = useState(ITEMS_PER_PAGE); // Pagination for photos

    const loadMedia = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get('/api/gallery');
            setMedia(res.data || []);
        } catch (err) {
            setError('Failed to load gallery');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMedia();
    }, [loadMedia]);

    // Lock body scroll when lightbox is open
    useEffect(() => {
        if (selectedId) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedId]);

    // Scroll to upload section when opened (improves mobile visibility)
    useEffect(() => {
        if (showUploadSection) {
            uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [showUploadSection]);

    const openUploadSection = () => {
        if (!token) {
            navigate('/login', { state: { from: '/user/gallery' } });
            return;
        }
        setShowUploadSection(true);
        // Small delay to ensure the upload section is rendered before scrolling
        setTimeout(() => {
            uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const openFilePicker = () => {
        if (!token) {
            navigate('/login', { state: { from: '/user/gallery' } });
            return;
        }
        fileInputRef.current?.click();
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFileName(file.name);
        }
    };

    const getOptimizedVideoUrl = (url) => {
        // ImageKit doesn't support f-auto for videos, return original URL
        return url;
    };

    const getPosterUrl = (url) => {
        if (!url || !url.includes('imagekit.io')) return '';
        const baseUrl = url.split('?')[0];
        const poster = baseUrl.endsWith('/') ? `${baseUrl}ik-thumbnail.jpg` : `${baseUrl}/ik-thumbnail.jpg`;
        return poster;
    };

    const handleUploadClick = async () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file) {
            setError('Please select a file first');
            setTimeout(() => setError(null), 3000);
            return;
        }
        if (!token) {
            setError('Please login to upload');
            setTimeout(() => setError(null), 3000);
            return;
        }

        const maxSize = 100 * 1024 * 1024;
        if (file.size > maxSize) {
            setError(`File too large! Max size is 100 MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)} MB`);
            setTimeout(() => setError(null), 5000);
            return;
        }

        setUploading(true);
        setError(null);
        setSuccess(null);
        try {
            const form = new FormData();
            form.append('file', file);
            form.append('title', newTitle || file.name);
            const categoryToUse = newCategory === 'Other' ? (customCategory || 'Hostel') : newCategory;
            form.append('category', categoryToUse);

            await axios.post('/api/gallery/upload', form, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setNewTitle('');
            setNewCategory('Hostel');
            setCustomCategory('');
            setSelectedFileName('');
            fileInputRef.current.value = '';
            setSelectedId(null);
            setSuccess('Upload successful! 🎉');
            setTimeout(() => {
                setSuccess(null);
                setShowUploadSection(false);
            }, 2000);
            await loadMedia();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Upload failed');
            setTimeout(() => setError(null), 4000);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!token) { 
            setError('Please login'); 
            setTimeout(() => setError(null), 3000);
            return; 
        }
        if (!window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
            return;
        }
        setDeleting(id); // Set loading state
        setError(null);
        setSuccess(null);
        try {
            await axios.delete(`/api/gallery/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setSuccess('Deleted successfully');
            setTimeout(() => setSuccess(null), 2000);
            await loadMedia();
        } catch (err) {
            setError(err.response?.data?.message || 'Delete failed');
            setTimeout(() => setError(null), 3000);
        } finally {
            setDeleting(null); // Clear loading state
        }
    };

    const toggleLike = async (id) => {
        if (!token) {
            navigate('/login', { state: { from: '/user/gallery' } });
            return;
        }
        try {
            const res = await axios.post(`/api/gallery/${id}/like`, {}, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            // Update local state based on server response
            await loadMedia(); // Reload to get fresh data
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to like');
            setTimeout(() => setError(null), 3000);
        }
    };

    const toggleDislike = async (id) => {
        if (!token) {
            navigate('/login', { state: { from: '/user/gallery' } });
            return;
        }
        try {
            const res = await axios.post(`/api/gallery/${id}/dislike`, {}, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            // Update local state based on server response
            await loadMedia(); // Reload to get fresh data
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to dislike');
            setTimeout(() => setError(null), 3000);
        }
    };

    const getFilteredMedia = () => {
        let filtered = media.filter((item) => {
            if (activeFilter === 'All') return true;
            if (activeFilter === 'Photos') return item.type === 'image' || !!item.imageUrl;
            if (activeFilter === 'Videos') return item.type === 'video';
            return (item.category || '').toLowerCase() === activeFilter.toLowerCase();
        });

        // In "All" view, show photos first, then videos
        if (activeFilter === 'All') {
            const photos = filtered.filter(item => (item.type === 'image') || !!item.imageUrl);
            const videos = filtered.filter(item => item.type === 'video');
            return { photos, videos, all: [...photos, ...videos] };
        }

        if (activeFilter === 'Photos') {
            const photos = filtered.filter(item => (item.type === 'image') || !!item.imageUrl);
            return { photos, videos: [], all: photos };
        }

        if (activeFilter === 'Videos') {
            const videos = filtered.filter(item => item.type === 'video');
            return { photos: [], videos, all: videos };
        }

        return { photos: filtered, videos: [], all: filtered };
    };

    const { photos, videos, all } = getFilteredMedia();
    const selectedMedia = media.find(m => m._id === selectedId);

    const EmptyPhotoBox = ({ label = 'Coming Soon', onClick }) => (
        <button type="button" onClick={onClick} className="bg-white dark:bg-gray-800 p-3 shadow-sm border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl flex flex-col items-center justify-center min-h-[250px] transition-colors hover:border-indigo-300 group cursor-pointer hover:bg-indigo-50 dark:hover:bg-gray-700 w-full">
            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-50 dark:group-hover:bg-gray-600">
                <span className="text-gray-300 dark:text-gray-500 group-hover:text-indigo-300 text-2xl">+</span>
            </div>
            <p className="text-gray-400 dark:text-gray-500 font-medium text-xs uppercase tracking-wider">{label}</p>
        </button>
    );

    return (
        <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-8 bg-[#FAFAFA] dark:bg-gray-900 min-h-screen">
            {/* Header */}
            <header className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">Hostel Life Gallery</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base italic mb-4">Capturing memories, one frame at a time.</p>
            </header>

            {/* Upload Section */}
            <AnimatePresence>
                {token && showUploadSection && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-8 overflow-hidden"
                        ref={uploadSectionRef}
                    >
                        <div className="p-4 sm:p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-700 relative">
                            <button
                                onClick={() => setShowUploadSection(false)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-2xl font-light transition-colors"
                                title="Close"
                            >
                                ×
                            </button>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">📸 Add More Memories</h3>
                            
                            {/* File Size Instructions */}
                            <div className="mb-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-left text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                <p className="font-semibold text-blue-900 dark:text-blue-300 mb-2">📁 File Size Limits:</p>
                                <ul className="space-y-1">
                                    <li>• <strong>Images:</strong> Max 50 MB per file</li>
                                    <li>• <strong>Videos:</strong> Max 100 MB per file</li>
                                    <li>• <strong>Supported:</strong> JPEG, PNG, MP4, WebM, MOV</li>
                                </ul>
                            </div>
                            
                            <div className="space-y-4">
                                <input 
                                    ref={fileInputRef} 
                                    type="file" 
                                    accept="image/*,video/*" 
                                    className="hidden" 
                                    onChange={handleFileSelect}
                                />
                                
                                <div className="flex items-center gap-3">
                                    {selectedFileName ? (
                                        <>
                                            <div className="flex-1 p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-green-300 dark:border-green-600">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">✓ Selected: {selectedFileName}</p>
                                            </div>
                                            <button
                                                onClick={() => { setSelectedFileName(''); fileInputRef.current.value = ''; }}
                                                className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm"
                                            >
                                                Clear
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={openFilePicker}
                                            className="flex-1 p-4 bg-white dark:bg-gray-800 border-2 border-dashed border-indigo-300 dark:border-indigo-600 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors text-center"
                                        >
                                            <p className="text-gray-700 dark:text-gray-300 font-medium">Click to select image or video</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Max 100MB</p>
                                        </button>
                                    )}
                                </div>
                                
                                {selectedFileName && (
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                                        <input
                                            type="text"
                                            placeholder="Title (optional)"
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 text-sm flex-1 sm:flex-none"
                                        />
                                        <select
                                            value={newCategory}
                                            onChange={(e) => setNewCategory(e.target.value)}
                                            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 text-sm flex-1 sm:flex-none"
                                        >
                                            {['Hostel','Rooms','Mess','Events','Other'].map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        {newCategory === 'Other' && (
                                            <input
                                                type="text"
                                                placeholder="Custom category"
                                                value={customCategory}
                                                onChange={(e) => setCustomCategory(e.target.value)}
                                                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 text-sm flex-1 sm:flex-none"
                                            />
                                        )}
                                        <button
                                            onClick={handleUploadClick}
                                            disabled={uploading}
                                            className={`px-6 py-2 rounded-lg text-sm font-semibold text-white w-full sm:w-auto ${
                                                uploading ? 'bg-indigo-300 dark:bg-indigo-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                                            } transition-all`}
                                        >
                                            {uploading ? 'Uploading…' : 'Upload'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filter Tabs */}
            <div className="flex flex-col gap-4 mb-8 md:mb-12 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    {token && (
                        <div className="flex-shrink-0 mr-3 sm:mr-4">
                            <button
                                onClick={() => setShowUploadSection(!showUploadSection)}
                                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
                                title={showUploadSection ? 'Hide upload' : 'Show upload'}
                                aria-label={showUploadSection ? 'Hide upload section' : 'Show upload section'}
                            >
                                <span className="text-lg sm:text-xl">+</span>
                            </button>
                        </div>
                    )}
                    <div className="flex gap-2 overflow-x-auto pb-2 snap-x no-scrollbar items-center min-w-0">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveFilter(tab);
                                    setDisplayedPhotos(ITEMS_PER_PAGE);
                                }}
                                className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex-shrink-0 snap-start ${
                                    activeFilter === tab
                                        ? 'bg-black dark:bg-indigo-600 text-white shadow-lg scale-105'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-black dark:hover:text-gray-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Loading / Error */}
            {loading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-12">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-32 sm:h-40 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-2xl" />
                    ))}
                </div>
            )}

            {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-center mb-8">
                    {error}
                </motion.div>
            )}

            {success && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-center mb-8">
                    {success}
                </motion.div>
            )}

            {!loading && !error && (

                <>
                    {/* All Section with Show More */}
                    {(activeFilter === 'All' || activeFilter === 'Photos') && photos.length > 0 && (
                        <section className="mb-12">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <span className="bg-indigo-500 w-1.5 h-4 rounded-full"></span>
                                    {activeFilter === 'All' ? 'Gallery' : 'Captured Frames'}
                                </h2>
                                {/* Removed header Show More; moved to 4th tile overlay */}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <AnimatePresence>
                                    {photos
                                        .slice(0, activeFilter === 'All' ? PREVIEW_ITEMS : displayedPhotos)
                                        .map((photo, idx) => {
                                            const isShowMoreTile = (activeFilter === 'All' && photos.length > PREVIEW_ITEMS && idx === PREVIEW_ITEMS - 1)
                                                || (activeFilter === 'Photos' && photos.length > PREVIEW_ITEMS && displayedPhotos === PREVIEW_ITEMS && idx === PREVIEW_ITEMS - 1);
                                            if (isShowMoreTile) {
                                                return (
                                                    <motion.div
                                                        key={photo._id}
                                                        layout
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        className="bg-white dark:bg-gray-800 p-3 shadow-sm border border-gray-100 dark:border-gray-700 rounded-3xl relative"
                                                    >
                                                        <div className="overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-700 relative aspect-[4/3]">
                                                            <img
                                                                src={photo.mediaUrl || photo.imageUrl}
                                                                alt={photo.title || 'Show More'}
                                                                className="absolute inset-0 w-full h-full object-cover opacity-60"
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    if (activeFilter === 'All') {
                                                                        setActiveFilter('Photos');
                                                                        setDisplayedPhotos(ITEMS_PER_PAGE);
                                                                    } else {
                                                                        setDisplayedPhotos(ITEMS_PER_PAGE);
                                                                    }
                                                                }}
                                                                className="absolute inset-0 flex items-center justify-center"
                                                                aria-label="Show more"
                                                            >
                                                                <span className="px-4 py-2 bg-black/70 text-white rounded-full text-sm font-semibold flex items-center gap-2">
                                                                    Show More
                                                                    <ChevronDown size={18} />
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                );
                                            }
                                            return (
                                                <motion.div
                                                    key={photo._id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    whileHover={{ y: -8 }}
                                                    onClick={() => setSelectedId(photo._id)}
                                                    className="bg-white dark:bg-gray-800 p-3 shadow-sm border border-gray-100 dark:border-gray-700 rounded-3xl cursor-pointer hover:shadow-2xl transition-all relative"
                                                >
                                                    {deleting === photo._id && (
                                                        <div className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center z-10">
                                                            <div className="animate-spin">
                                                                <div className="h-8 w-8 border-4 border-white border-t-transparent rounded-full"></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-700 relative aspect-[4/3]">
                                                        <img
                                                            src={photo.mediaUrl || photo.imageUrl}
                                                            alt={photo.title || 'Hostel'}
                                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                                        />
                                                    </div>
                                                    <div className="pt-4 pb-2 px-2 flex items-center justify-between gap-2 min-w-0">
                                                        <p className="font-bold text-gray-800 dark:text-gray-200 text-sm flex-1 truncate">{photo.title || 'Hostel'}</p>
                                                        <span className="hidden sm:inline-flex text-[9px] font-black text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full uppercase flex-shrink-0">{photo.category || 'Hostel'}</span>
                                                        {token && (user?.role === 'admin' || String(photo.uploadedBy) === String(user?.id || user?._id)) && (
                                                            <button 
                                                                onClick={(e) => { 
                                                                    e.stopPropagation(); 
                                                                    handleDelete(photo._id); 
                                                                }} 
                                                                disabled={deleting === photo._id}
                                                                className="text-red-500 text-xs font-bold hover:underline disabled:opacity-50 flex-shrink-0"
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                </AnimatePresence>
                                <EmptyPhotoBox label="Add more memories" onClick={openUploadSection} />
                            </div>
                            {activeFilter === 'Photos' && displayedPhotos < photos.length && (
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => setDisplayedPhotos(prev => prev + ITEMS_PER_PAGE)}
                                    className="mt-8 mx-auto flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
                                >
                                    <span>Show More</span>
                                    <ChevronDown size={20} />
                                </motion.button>
                            )}
                        </section>
                    )}

                    {/* Category Images (Rooms, Mess, Events, etc.) */}
                    {!(activeFilter === 'All' || activeFilter === 'Photos' || activeFilter === 'Videos') && all.length > 0 && (
                        <section className="mb-12">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <span className="bg-indigo-500 w-1.5 h-4 rounded-full"></span>
                                    {activeFilter}
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <AnimatePresence>
                                    {all
                                        .filter(item => (item.type === 'image') || !!item.imageUrl)
                                        .slice(0, displayedPhotos)
                                        .map((photo, idx, arr) => {
                                            const totalImages = all.filter(item => (item.type === 'image') || !!item.imageUrl).length;
                                            const isShowMoreTile = totalImages > PREVIEW_ITEMS && displayedPhotos === PREVIEW_ITEMS && idx === PREVIEW_ITEMS - 1;
                                            if (isShowMoreTile) {
                                                return (
                                                    <motion.div
                                                        key={photo._id}
                                                        layout
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        className="bg-white dark:bg-gray-800 p-3 shadow-sm border border-gray-100 dark:border-gray-700 rounded-3xl relative"
                                                    >
                                                        <div className="overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-700 relative aspect-[4/3]">
                                                            <img
                                                                src={photo.mediaUrl || photo.imageUrl}
                                                                alt={photo.title || activeFilter}
                                                                className="absolute inset-0 w-full h-full object-cover opacity-60"
                                                            />
                                                            <button
                                                                onClick={() => setDisplayedPhotos(ITEMS_PER_PAGE)}
                                                                className="absolute inset-0 flex items-center justify-center"
                                                                aria-label="Show more"
                                                            >
                                                                <span className="px-4 py-2 bg-black/70 text-white rounded-full text-sm font-semibold flex items-center gap-2">
                                                                    Show More
                                                                    <ChevronDown size={18} />
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                );
                                            }
                                            return (
                                                <motion.div
                                                    key={photo._id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    whileHover={{ y: -8 }}
                                                    onClick={() => setSelectedId(photo._id)}
                                                    className="bg-white dark:bg-gray-800 p-3 shadow-sm border border-gray-100 dark:border-gray-700 rounded-3xl cursor-pointer hover:shadow-2xl transition-all relative"
                                                >
                                                    {deleting === photo._id && (
                                                        <div className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center z-10">
                                                            <div className="animate-spin">
                                                                <div className="h-8 w-8 border-4 border-white border-t-transparent rounded-full"></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-700 relative aspect-[4/3]">
                                                        <img
                                                            src={photo.mediaUrl || photo.imageUrl}
                                                            alt={photo.title || activeFilter}
                                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                                        />
                                                    </div>
                                                    <div className="pt-4 pb-2 px-2 flex items-center justify-between gap-2 min-w-0">
                                                        <p className="font-bold text-gray-800 dark:text-gray-200 text-sm flex-1 truncate">{photo.title || activeFilter}</p>
                                                        <span className="hidden sm:inline-flex text-[9px] font-black text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full uppercase flex-shrink-0">{photo.category || activeFilter}</span>
                                                        {token && (user?.role === 'admin' || String(photo.uploadedBy) === String(user?.id || user?._id)) && (
                                                            <button 
                                                                onClick={(e) => { 
                                                                    e.stopPropagation(); 
                                                                    handleDelete(photo._id); 
                                                                }} 
                                                                disabled={deleting === photo._id}
                                                                className="text-red-500 text-xs font-bold hover:underline disabled:opacity-50 flex-shrink-0"
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                </AnimatePresence>
                            </div>
                            {displayedPhotos < all.filter(item => (item.type === 'image') || !!item.imageUrl).length && (
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => setDisplayedPhotos(prev => prev + ITEMS_PER_PAGE)}
                                    className="mt-8 mx-auto flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
                                >
                                    <span>Show More</span>
                                    <ChevronDown size={20} />
                                </motion.button>
                            )}
                        </section>
                    )}

                    {/* Videos Section */}
                    {(activeFilter === 'All' || activeFilter === 'Videos') && videos.length > 0 && (
                        <section>
                            <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                                <span className="bg-purple-500 w-1.5 h-4 rounded-full"></span>
                                {activeFilter === 'All' ? 'Reels' : 'Video Reels'}
                            </h2>
                            <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory no-scrollbar">
                                <AnimatePresence>
                                    {videos.map((vid) => (
                                        <motion.div
                                            key={vid._id}
                                            layout
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => setSelectedId(vid._id)}
                                            className="flex-shrink-0 w-[180px] h-[320px] md:w-[240px] md:h-[426px] rounded-3xl overflow-hidden shadow-2xl bg-black relative snap-center cursor-pointer group"
                                        >
                                            {deleting === vid._id && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                                    <div className="animate-spin">
                                                        <div className="h-8 w-8 border-4 border-white border-t-transparent rounded-full"></div>
                                                    </div>
                                                </div>
                                            )}
                                            <video 
                                                src={getOptimizedVideoUrl(vid.mediaUrl)} 
                                                poster={getPosterUrl(vid.mediaUrl)}
                                                loading="lazy"
                                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                                            />

                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
                                                <div className="absolute top-4 right-4">
                                                    {token && (user?.role === 'admin' || String(vid.uploadedBy) === String(user?.id || user?._id)) && (
                                                        <button 
                                                            onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                handleDelete(vid._id); 
                                                            }}
                                                            disabled={deleting === vid._id}
                                                            className="text-red-400 text-xs font-bold hover:text-red-300 hover:underline bg-black/40 px-2 py-1 rounded-md disabled:opacity-50"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="absolute bottom-4 left-4 right-4">
                                                    <p className="text-white font-semibold text-sm line-clamp-2 drop-shadow-md">
                                                        {vid.title}
                                                    </p>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                                            <span className="text-white text-[10px]">▶</span>
                                                        </div>
                                                        <span className="text-white/80 text-[10px] uppercase font-bold tracking-wider">Watch Reel</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </section>
                    )}

                    {/* Lightbox Overlay */}
                    <AnimatePresence>
                        {selectedId && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl overflow-hidden"
                                onClick={() => setSelectedId(null)}
                            >
                                <motion.div
                                    initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                                    className="max-w-4xl w-full h-full max-h-[90vh] flex items-center justify-center relative"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button className="absolute -top-12 right-0 text-white text-5xl font-thin hover:rotate-90 transition-transform" onClick={() => setSelectedId(null)}>&times;</button>
                                    {selectedMedia?.type === 'image' || selectedMedia?.imageUrl ? (
                                        <img src={selectedMedia?.mediaUrl || selectedMedia?.imageUrl} className="max-h-full rounded-2xl shadow-2xl" alt="" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-black rounded-3xl overflow-hidden border border-white/10">
                                            <video 
                                                src={getOptimizedVideoUrl(selectedMedia?.mediaUrl)} 
                                                poster={getPosterUrl(selectedMedia?.mediaUrl)}
                                                controls 
                                                loading="lazy"
                                                className="w-full h-full object-contain" 
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </div>
    );
};

export default Gallery;
