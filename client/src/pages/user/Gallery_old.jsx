import React, { useState, useRef, useEffect } from 'react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';

const Gallery = () => {
    const [media, setMedia] = useState([]);
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedFileName, setSelectedFileName] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const [newCategory, setNewCategory] = useState('Hostel');
    const [customCategory, setCustomCategory] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [showUploadSection, setShowUploadSection] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [token, setToken] = useState(() => {
        try {
            const stored = localStorage.getItem('userInfo');
            return stored ? JSON.parse(stored).token : null;
        } catch {
            return null;
        }
    });
    const fileInputRef = useRef();
    const navigate = useNavigate();

    const loadMedia = async () => {
        try {
            const res = await api.get('/api/gallery');
            setMedia(res.data || []);
        } catch (err) {
            setError('Failed to load media');
        }
    };

    useEffect(() => { loadMedia(); }, []);

    const openFile = () => {
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
        if (!url || !url.includes('imagekit.io')) return url;
        if (url.includes('/ik-thumbnail.jpg')) return url;
        const optimized = url.includes('?') ? `${url}&tr=f-auto,q-auto` : `${url}?tr=f-auto,q-auto`;
        return optimized;
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
            return;
        }
        if (!token) {
            setError('Please login to upload');
            return;
        }
        const maxSize = 100 * 1024 * 1024;
        if (file.size > maxSize) {
            setError(`File too large! Max size is 100 MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)} MB`);
            return;
        }
        setUploading(true);
        setError(null);
        try {
            const form = new FormData();
            form.append('file', file);
            form.append('title', newTitle || file.name);
            const categoryToUse = newCategory === 'Other' ? (customCategory || 'Hostel') : newCategory;
            form.append('category', categoryToUse);
            await api.post('/api/gallery/upload', form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewTitle('');
            setNewCategory('Hostel');
            setCustomCategory('');
            setSelectedFileName('');
            fileInputRef.current.value = '';
            setSelectedId(null);
            await loadMedia();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!token) { setError('Please login'); return; }
        if (!window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
            return;
        }
        try {
            await api.delete(`/api/gallery/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            await loadMedia();
        } catch (err) {
            setError(err.response?.data?.message || 'Delete failed');
        }
    };

    const filteredMedia = media.filter((item) => {
        if (activeFilter === 'All') return true;
        if (activeFilter === 'Photos') return item.type === 'image' || !!item.imageUrl;
        if (activeFilter === 'Videos') return item.type === 'video';
        return (item.category || '').toLowerCase() === activeFilter.toLowerCase();
    });

    const photos = filteredMedia.filter(item => (item.type === 'image') || !!item.imageUrl);
    const videos = filteredMedia.filter(item => item.type === 'video');
    const selectedMedia = media.find(m => m._id === selectedId);

    const EmptyPhotoBox = ({ label = 'Coming Soon', onClick }) => (
        <div onClick={onClick} className="break-inside-avoid bg-white p-3 shadow-sm border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center min-h-[250px] transition-colors hover:border-indigo-300 group cursor-pointer hover:bg-indigo-50">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-50">
                <span className="text-gray-300 group-hover:text-indigo-300 text-2xl">+</span>
            </div>
            <p className="text-gray-400 font-medium text-xs uppercase tracking-wider">{label}</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-8 bg-[#FAFAFA] dark:bg-gray-900 min-h-screen">
            {/* Header with Instructions */}
            <header className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">Hostel Life Gallery</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base italic mb-4">Capturing memories, one frame at a time.</p>
            </header>

            {/* --- UPLOAD SECTION (AT TOP) --- */}
            <AnimatePresence>
                {token && showUploadSection && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-8 overflow-hidden"
                    >
                        <div className="p-4 sm:p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-700">
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
                        {/* File Input - Hidden */}
                        <input 
                            ref={fileInputRef} 
                            type="file" 
                            accept="image/*,video/*" 
                            className="hidden" 
                            onChange={handleFileSelect}
                        />
                        
                        {/* File Selection Display */}
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
                                    onClick={openFile}
                                    className="flex-1 p-4 bg-white dark:bg-gray-800 border-2 border-dashed border-indigo-300 dark:border-indigo-600 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors text-center"
                                >
                                    <p className="text-gray-700 dark:text-gray-300 font-medium">Click to select image or video</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Max 100MB</p>
                                </button>
                            )}
                        </div>
                        
                        {/* Upload Form */}
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

            {/* --- FILTER TABS --- */}
            <div className="flex flex-col gap-4 mb-8 md:mb-12 pb-4 border-b border-gray-100 dark:border-gray-700">
                {/* Filter Tabs - Horizontally scrollable on mobile */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 snap-x no-scrollbar items-center">
                    {token && (
                        <button
                            onClick={() => setShowUploadSection(!showUploadSection)}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-110 flex-shrink-0"
                            title={showUploadSection ? 'Hide upload' : 'Show upload'}
                        >
                            <span className="text-xl">+</span>
                        </button>
                    )}
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveFilter(tab)}
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

            {/* --- LOADING / ERROR --- */}
            {loading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-12">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-32 sm:h-40 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-2xl" />
                    ))}
                </div>
            )}
            {error && (
                <div className="mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-xs sm:text-sm text-center font-medium">
                    {error}
                </div>
            )}

            {/* --- REELS VIDEO SECTION --- */}
            {(activeFilter === 'All' || activeFilter === 'Videos') && videos.length > 0 && (
                <section className="mb-16">
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <span className="bg-gradient-to-tr from-purple-500 to-pink-500 w-1.5 h-4 rounded-full"></span>
                        Hostel Reels
                    </h2>
                    <div className="flex overflow-x-auto gap-4 pb-8 snap-x no-scrollbar">
                        {videos.map((vid) => (
                            <motion.div
                                key={vid._id}
                                layout
                                whileHover={{ scale: 1.02 }}
                                onClick={() => setSelectedId(vid._id)}
                                className="flex-shrink-0 w-[180px] h-[320px] md:w-[240px] md:h-[426px] rounded-3xl overflow-hidden shadow-2xl bg-black relative snap-center cursor-pointer group"
                            >
                                <video 
                                    src={getOptimizedVideoUrl(vid.mediaUrl)} 
                                    poster={getPosterUrl(vid.mediaUrl)}
                                    loading="lazy"
                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                                />

                                {/* Reels Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
                                    <div className="absolute top-4 right-4">
                                        {token && (user?.role === 'admin' || String(vid.uploadedBy) === String(user?.id || user?._id)) && (
                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(vid._id); }} className="text-red-400 text-xs font-bold hover:text-red-300 hover:underline bg-black/40 px-2 py-1 rounded-md">Delete</button>
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
                    </div>
                </section>
            )}

            {/* --- PHOTO GRID SECTION --- */}
            {(activeFilter === 'All' || activeFilter === 'Photos' || activeFilter !== 'Videos') && (
                <section>
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                        <span className="bg-indigo-500 w-1.5 h-4 rounded-full"></span>
                        Captured Frames
                    </h2>

                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                        <AnimatePresence>
                            {photos.map((photo) => (
                                <motion.div
                                    key={photo._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    whileHover={{ y: -8 }}
                                    onClick={() => setSelectedId(photo._id)}
                                    className="break-inside-avoid bg-white p-3 shadow-sm border border-gray-100 rounded-3xl cursor-pointer hover:shadow-2xl transition-all"
                                >
                                    <div className="overflow-hidden rounded-2xl bg-gray-50">
                                        <img
                                            src={photo.mediaUrl || photo.imageUrl}
                                            alt={photo.title || photo.description || 'Hostel'}
                                            className="w-full h-auto object-cover transition-transform duration-700 hover:scale-110"
                                        />
                                    </div>
                                    <div className="pt-4 pb-2 px-2 flex justify-between items-center">
                                        <p className="font-bold text-gray-800 text-sm">{photo.title || 'Hostel'}</p>
                                        <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full uppercase">{photo.category || 'Hostel'}</span>
                                        {token && (user?.role === 'admin' || String(photo.uploadedBy) === String(user?.id || user?._id)) && (
                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(photo._id); }} className="text-red-500 text-xs font-bold hover:underline">Delete</button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        <EmptyPhotoBox label="Add more memories" onClick={openFile} />
                    </div>
                </section>
            )}

            {/* Lightbox Overlay */}
            <AnimatePresence>
                {selectedId && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl"
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
                                    {selectedMedia?.mediaUrl && (
                                        <video 
                                            key={`video-${selectedMedia._id}`}
                                            src={selectedMedia.mediaUrl}
                                            controls 
                                            autoPlay 
                                            muted={false}
                                            className="max-w-full max-h-full object-contain" 
                                            controlsList="nodownload"
                                        />
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default Gallery;
