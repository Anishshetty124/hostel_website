import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import { hashFile } from '../../utils/fileHash';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ChevronDown, ChevronUp } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { GalleryGridSkeleton } from '../../components/SkeletonLoaders';

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
    const [selectedFiles, setSelectedFiles] = useState([]); // Multiple file selection
    const [selectedFileHashes, setSelectedFileHashes] = useState([]); // Hashes for deduplication

    // Pagination state for lazy loading
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [mediaLoading, setMediaLoading] = useState(false);

    const loadMedia = useCallback(async (reset = false, filterOverride) => {
        setLoading(reset);
        setMediaLoading(!reset);
        setError(null);
        try {
            const filter = filterOverride || activeFilter;
            const params = new URLSearchParams();
            params.set('page', reset ? 1 : page);
            // Load more items upfront for "All" view to ensure we have enough images
            params.set('limit', filter === 'All' ? ITEMS_PER_PAGE * 2 : ITEMS_PER_PAGE);
            if (filter === 'Photos') params.set('type', 'image');
            if (filter === 'Videos') params.set('type', 'video');
            if (filter !== 'All' && filter !== 'Photos' && filter !== 'Videos') {
                params.set('category', filter);
            }
            const res = await api.get(`/gallery?${params.toString()}`);
            const newMedia = res.data || [];
            if (reset) {
                setMedia(newMedia);
                setPage(2);
            } else {
                setMedia(prev => [...prev, ...newMedia]);
                setPage(prev => prev + 1);
            }
            setHasMore(newMedia.length === (filter === 'All' ? ITEMS_PER_PAGE * 2 : ITEMS_PER_PAGE));
        } catch (err) {
            setError('Failed to load gallery');
        } finally {
            setLoading(false);
            setMediaLoading(false);
        }
    }, [page, activeFilter]);

    useEffect(() => {
        setPage(1);
        setHasMore(true);
        setDisplayedPhotos(ITEMS_PER_PAGE);
        loadMedia(true, activeFilter);
        // eslint-disable-next-line
    }, [activeFilter]);

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

    const openCamera = () => {
        if (!token) {
            navigate('/login', { state: { from: '/user/gallery' } });
            return;
        }
        fileInputRef.current?.setAttribute('capture', 'environment');
        fileInputRef.current?.click();
        setTimeout(() => fileInputRef.current?.removeAttribute('capture'), 1000);
    };

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files || []);
        let errorFound = false;
        const newFiles = [];
        const newHashes = [];
        for (const file of files) {
            try {
                const hash = await hashFile(file);
                if (selectedFileHashes.includes(hash) || newHashes.includes(hash)) {
                    errorFound = true;
                    continue;
                }
                newFiles.push(file);
                newHashes.push(hash);
            } catch (err) {
                // Ignore file if hashing fails
            }
        }
        if (errorFound) {
            setError('Duplicate files were ignored.');
            setTimeout(() => setError(null), 3000);
        }
        setSelectedFiles(prev => [...prev, ...newFiles]);
        setSelectedFileHashes(prev => [...prev, ...newHashes]);
        setSelectedFileName([...selectedFiles, ...newFiles].map(f => f.name).join(', '));
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
        if (!selectedFiles.length) {
            setError('Please select file(s) first');
            setTimeout(() => setError(null), 3000);
            return;
        }
        if (!token) {
            setError('Please login to upload');
            setTimeout(() => setError(null), 3000);
            return;
        }
        const maxSize = 100 * 1024 * 1024;
        for (const file of selectedFiles) {
            if (file.size > maxSize) {
                setError(`File too large! Max size is 100 MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)} MB`);
                setTimeout(() => setError(null), 5000);
                return;
            }
        }
        // Fire-and-forget UX
        setSuccess('Your files will be uploaded in the background.');
        setSelectedFileName('');
        setSelectedFiles([]);
        setSelectedFileHashes([]);
        fileInputRef.current.value = '';
        setNewTitle('');
        setNewCategory('Hostel');
        setCustomCategory('');
        setTimeout(() => setSuccess(null), 3000);
        setShowUploadSection(false);
        // Upload in background
        (async () => {
            try {
                for (const file of selectedFiles) {
                    const form = new FormData();
                    form.append('file', file);
                    form.append('title', newTitle || file.name);
                    const categoryToUse = newCategory === 'Other' ? (customCategory || 'Hostel') : newCategory;
                    form.append('category', categoryToUse);
                    await api.post('/gallery/upload', form, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }
                await loadMedia();
            } catch (err) {
                // Optionally: show a toast or notification
            }
        })();
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
        // Remove from UI immediately
        setMedia(prev => prev.filter(item => item._id !== id));
        setError(null);
        setSuccess(null);
        setDeleting(id); // Set loading state (optional, for button state)
        try {
            await api.delete(`/gallery/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setSuccess('Deleted successfully');
            setTimeout(() => setSuccess(null), 2000);
        } catch (err) {
            if (err.response?.status === 404) {
                setError('File not found or already deleted.');
            } else {
                setError(err.response?.data?.message || 'Delete failed');
            }
            setTimeout(() => setError(null), 3000);
        } finally {
            setDeleting(null); // Clear loading state
        }
    };

    // Likes/Dislikes removed

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
    const categoryImages = all.filter(item => (item.type === 'image') || !!item.imageUrl);
    const selectedMedia = media.find(m => m._id === selectedId);

    const EmptyPhotoBox = ({ label = 'Coming Soon', onClick }) => (
        <button type="button" onClick={onClick} className="bg-white dark:bg-gray-800 p-3 shadow-lg shadow-gray-200/60 dark:shadow-black/10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl flex flex-col items-center justify-center min-h-[250px] transition-colors hover:border-indigo-400 group cursor-pointer hover:bg-indigo-50 dark:hover:bg-gray-700 w-full">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-100 dark:group-hover:bg-gray-600 border border-gray-200 dark:border-transparent">
                <span className="text-gray-300 dark:text-gray-500 group-hover:text-indigo-300 text-2xl">+</span>
            </div>
            <p className="text-gray-400 dark:text-gray-500 font-medium text-xs uppercase tracking-wider">{label}</p>
        </button>
    );

    return (
        <div className="max-w-7xl mx-auto p-1 xs:p-2 sm:p-4 md:p-8 min-h-screen">
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
                                    multiple
                                    onChange={handleFileSelect}
                                />
                                
                                {selectedFiles.length > 0 && (
                                    <div className="flex flex-wrap gap-3 mb-2 items-center">
                                        {selectedFiles.map((file, idx) => (
                                            <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-indigo-300 dark:border-indigo-600 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                                {file.type.startsWith('image') ? (
                                                    <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                                )}
                                                <button
                                                    onClick={() => {
                                                        const newFiles = [...selectedFiles];
                                                        newFiles.splice(idx, 1);
                                                        setSelectedFiles(newFiles);
                                                        setSelectedFileName(newFiles.map(f => f.name).join(', '));
                                                    }}
                                                    className="absolute -top-3 -right-3 w-12 h-12 flex items-center justify-center rounded-full bg-white border-4 border-red-600 text-red-600 text-4xl font-extrabold shadow-lg z-10 hover:bg-red-600 hover:text-white transition-colors"
                                                    aria-label="Remove"
                                                    type="button"
                                                    style={{ boxShadow: '0 2px 12px 0 rgba(255,0,0,0.15)' }}
                                                >
                                                    <span style={{fontSize: '2.5rem', color: '#dc2626', fontWeight: 900, lineHeight: 1}}>×</span>
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={openFilePicker}
                                            className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-indigo-300 dark:border-indigo-600 rounded-lg bg-white dark:bg-gray-800 text-indigo-500 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 ml-2"
                                            style={{ minWidth: '6rem' }}
                                        >
                                            <span className="text-3xl">+</span>
                                            <span className="text-xs mt-1">Add More</span>
                                        </button>
                                    </div>
                                )}
                                
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
                <GalleryGridSkeleton count={6} />
            )}
            {mediaLoading && !loading && (
                <GalleryGridSkeleton count={3} />
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
                    {/* No Images Message */}
                    {(activeFilter === 'All' || activeFilter === 'Photos') && photos.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 48 48" className="w-16 h-16 mb-4 opacity-40"><path stroke="currentColor" strokeWidth="2" d="M8 40V12a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v28M8 40h32M8 40v-4a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v4M24 20v8m0 0-3-3m3 3 3-3"/></svg>
                            <div className="text-lg font-semibold mb-2">No images yet</div>
                            <div className="text-sm">Be the first to add memories to the gallery!</div>
                        </div>
                    )}
                    {/* All Section with Show More */}
                    {(activeFilter === 'All' || activeFilter === 'Photos') && (activeFilter === 'All' ? all.length > 0 : photos.length > 0) && (
                        <section className="mb-12">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <span className="bg-indigo-500 w-1.5 h-4 rounded-full"></span>
                                    {activeFilter === 'All' ? 'Gallery' : 'Captured Frames'}
                                </h2>
                                {/* Removed header Show More; moved to 4th tile overlay */}
                            </div>
                            <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-6">
                                <AnimatePresence>
                                    {(activeFilter === 'All' ? categoryImages : photos)
                                        .slice(0, activeFilter === 'All' ? PREVIEW_ITEMS : displayedPhotos)
                                        .map((photo, idx) => {
                                            const displayItems = activeFilter === 'All' ? categoryImages : photos;
                                            const itemsToShow = displayItems.slice(0, activeFilter === 'All' ? PREVIEW_ITEMS : displayedPhotos);
                                            const lastIndex = itemsToShow.length - 1;
                                            const isShowMoreTile = (activeFilter === 'All' && (categoryImages.length > PREVIEW_ITEMS || hasMore) && idx === lastIndex)
                                                || (activeFilter === 'Photos' && photos.length > displayedPhotos && displayedPhotos === PREVIEW_ITEMS && idx === lastIndex);
                                            if (isShowMoreTile) {
                                                return (
                                                    <motion.div
                                                        key={photo._id + '-' + idx}
                                                        layout
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        className="bg-white dark:bg-gray-800 p-1.5 shadow-sm border border-gray-100 dark:border-gray-700 rounded-3xl relative"
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
                                                    key={photo._id + '-' + idx}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    whileHover={{ y: -8 }}
                                                    onClick={() => setSelectedId(photo._id)}
                                                    className="bg-white dark:bg-gray-800 p-1.5 shadow-sm border border-gray-100 dark:border-gray-700 rounded-3xl cursor-pointer hover:shadow-2xl transition-all relative"
                                                >
                                                    {deleting === photo._id && (
                                                        <div className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center z-10">
                                                            <div className="animate-spin">
                                                                <div className="h-8 w-8 border-4 border-white border-t-transparent rounded-full"></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-700 relative aspect-[4/3] group">
                                                        <img
                                                            src={photo.mediaUrl || photo.imageUrl}
                                                            alt={photo.title || 'Hostel'}
                                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                                            onError={e => {
                                                                e.target.style.display = 'none';
                                                                const parent = e.target.parentNode;
                                                                if (parent && !parent.querySelector('.img-error-msg')) {
                                                                    const msg = document.createElement('div');
                                                                    msg.className = 'img-error-msg absolute inset-0 flex items-center justify-center bg-red-100/80 text-red-700 text-xs font-bold z-20';
                                                                    msg.innerText = 'Image failed to load (400 Bad Request)';
                                                                    parent.appendChild(msg);
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="pt-4 pb-2 px-2 flex items-center justify-between gap-2 min-w-0">
                                                        <p className="font-bold text-gray-800 dark:text-gray-200 text-sm flex-1 truncate">{photo.title || 'Hostel'}</p>
                                                        <span className="hidden sm:inline-flex text-[9px] font-black text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full uppercase flex-shrink-0">{photo.category || 'Hostel'}</span>
                                                        {token && String(photo.uploadedBy) === String(user?.id || user?._id) && (
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
                                {activeFilter !== 'All' && (
                                    <div className="hidden md:block">
                                        <EmptyPhotoBox label="Add more memories" onClick={openUploadSection} />
                                    </div>
                                )}
                            </div>
                            {activeFilter === 'Photos' && (displayedPhotos < photos.length || hasMore) && (
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => {
                                        if (displayedPhotos >= photos.length - ITEMS_PER_PAGE && hasMore) {
                                            loadMedia();
                                            setDisplayedPhotos(prev => prev + ITEMS_PER_PAGE);
                                        } else {
                                            setDisplayedPhotos(prev => prev + ITEMS_PER_PAGE);
                                        }
                                    }}
                                    className="mt-8 mx-auto flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
                                    disabled={mediaLoading}
                                >
                                    <span>{mediaLoading ? 'Loading…' : 'Show More'}</span>
                                    <ChevronDown size={20} />
                                </motion.button>
                            )}
                            {activeFilter === 'Photos' && displayedPhotos > ITEMS_PER_PAGE && (
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => {
                                        setDisplayedPhotos(ITEMS_PER_PAGE);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="mt-4 mx-auto flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
                                >
                                    <span>Show Less</span>
                                    <ChevronUp size={20} />
                                </motion.button>
                            )}
                            {activeFilter !== 'All' && (
                                <div className="mt-6 block md:hidden">
                                    <EmptyPhotoBox label="Add more memories" onClick={openUploadSection} />
                                </div>
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
                            <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-6">
                                <AnimatePresence>
                                    {categoryImages
                                        .slice(0, displayedPhotos)
                                        .map((photo, idx) => {
                                            const totalImages = categoryImages.length;
                                            const isShowMoreTile = totalImages > PREVIEW_ITEMS && displayedPhotos === PREVIEW_ITEMS && idx === PREVIEW_ITEMS - 1;
                                            if (isShowMoreTile) {
                                                return (
                                                    <motion.div
                                                        key={photo._id + '-' + idx}
                                                        layout
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        className="bg-white dark:bg-gray-800 p-1.5 shadow-sm border border-gray-100 dark:border-gray-700 rounded-3xl relative"
                                                    >
                                                        <div className="overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-700 relative aspect-[4/3]">
                                                            <img
                                                                src={photo.mediaUrl || photo.imageUrl}
                                                                alt={photo.title || activeFilter}
                                                                className="absolute inset-0 w-full h-full object-cover opacity-60"
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    if (displayedPhotos >= totalImages - ITEMS_PER_PAGE && hasMore) {
                                                                        loadMedia();
                                                                        setDisplayedPhotos(prev => prev + ITEMS_PER_PAGE);
                                                                    } else {
                                                                        setDisplayedPhotos(prev => prev + ITEMS_PER_PAGE);
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
                                                    key={photo._id + '-' + idx}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    whileHover={{ y: -8 }}
                                                    onClick={() => setSelectedId(photo._id)}
                                                    className="bg-white dark:bg-gray-800 p-1.5 shadow-sm border border-gray-100 dark:border-gray-700 rounded-3xl cursor-pointer hover:shadow-2xl transition-all relative"
                                                >
                                                    {deleting === photo._id && (
                                                        <div className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center z-10">
                                                            <div className="animate-spin">
                                                                <div className="h-8 w-8 border-4 border-white border-t-transparent rounded-full"></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-700 relative aspect-[4/3] group">
                                                        <img
                                                            src={photo.mediaUrl || photo.imageUrl}
                                                            alt={photo.title || activeFilter}
                                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                                            onError={e => { e.target.style.display = 'none'; }}
                                                        />
                                                    </div>
                                                    <div className="pt-4 pb-2 px-2 flex items-center justify-between gap-2 min-w-0">
                                                        <p className="font-bold text-gray-800 dark:text-gray-200 text-sm flex-1 truncate">{photo.title || activeFilter}</p>
                                                        <span className="hidden sm:inline-flex text-[9px] font-black text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full uppercase flex-shrink-0">{photo.category || activeFilter}</span>
                                                        {token && String(photo.uploadedBy) === String(user?.id || user?._id) && (
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
                            {(displayedPhotos < categoryImages.length || hasMore) && (
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => {
                                        if (displayedPhotos >= categoryImages.length - ITEMS_PER_PAGE && hasMore) {
                                            loadMedia();
                                        }
                                        setDisplayedPhotos(prev => prev + ITEMS_PER_PAGE);
                                    }}
                                    className="mt-8 mx-auto flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
                                    disabled={mediaLoading}
                                >
                                    <span>{mediaLoading ? 'Loading…' : 'Show More'}</span>
                                    <ChevronDown size={20} />
                                </motion.button>
                            )}
                            {displayedPhotos > ITEMS_PER_PAGE && (
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => {
                                        setDisplayedPhotos(ITEMS_PER_PAGE);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="mt-4 mx-auto flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
                                >
                                    <span>Show Less</span>
                                    <ChevronUp size={20} />
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
                            <div className="relative">
                                <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-700">
                                    <AnimatePresence>
                                        {videos.map((vid, idx) => (
                                        <motion.div
                                            key={vid._id + '-' + idx}
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
                                                    {token && String(vid.uploadedBy) === String(user?.id || user?._id) && (
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
                            </div>
                            {activeFilter === 'All' && (
                                <div className="mt-6">
                                    <EmptyPhotoBox label="Add more memories" onClick={openUploadSection} />
                                </div>
                            )}

                        </section>
                    )}

                    {/* Lightbox Overlay */}
                    <AnimatePresence>
                        {selectedId && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-1 sm:p-4 backdrop-blur-xl overflow-y-auto"
                                onClick={() => setSelectedId(null)}
                            >
                                <motion.div
                                    initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                                    className="w-full max-w-xs xs:max-w-sm sm:max-w-lg md:max-w-3xl lg:max-w-5xl xl:max-w-6xl h-auto max-h-[95vh] flex items-center justify-center relative"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button 
                                        className="absolute top-2 right-2 text-white text-3xl sm:text-5xl font-thin hover:rotate-90 transition-transform bg-black/40 rounded-full px-2 py-0.5 sm:px-3 sm:py-1 z-50" 
                                        style={{ zIndex: 100, pointerEvents: 'auto' }}
                                        onClick={() => setSelectedId(null)}
                                        aria-label="Close"
                                    >
                                        &times;
                                    </button>
                                    {/* Download Button */}
                                    <button 
                                        className="absolute bottom-4 right-4 text-white text-sm sm:text-base font-semibold bg-indigo-600 hover:bg-indigo-700 rounded-full px-4 sm:px-6 py-2 sm:py-3 z-50 flex items-center gap-2 shadow-lg transition-all hover:scale-105" 
                                        style={{ zIndex: 100, pointerEvents: 'auto' }}
                                        onClick={async () => {
                                            const url = selectedMedia?.mediaUrl || selectedMedia?.imageUrl;
                                            const filename = selectedMedia?.title || 'hostel-image';
                                            try {
                                                const response = await fetch(url);
                                                const blob = await response.blob();
                                                const blobUrl = window.URL.createObjectURL(blob);
                                                const link = document.createElement('a');
                                                link.href = blobUrl;
                                                link.download = filename;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                                window.URL.revokeObjectURL(blobUrl);
                                            } catch (err) {
                                                // Fallback: open in new tab
                                                window.open(url, '_blank');
                                            }
                                        }}
                                        aria-label="Download"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                        </svg>
                                        <span className="hidden xs:inline">Download</span>
                                    </button>
                                    {selectedMedia?.type === 'image' || selectedMedia?.imageUrl ? (
                                        <img src={selectedMedia?.mediaUrl || selectedMedia?.imageUrl} className="max-h-[85vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain" alt="" onError={e => { e.target.style.display = 'none'; }} />
                                    ) : (
                                        <video 
                                            src={getOptimizedVideoUrl(selectedMedia?.mediaUrl)} 
                                            poster={getPosterUrl(selectedMedia?.mediaUrl)}
                                            controls 
                                            loading="lazy"
                                            className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl"
                                            style={{ minWidth: '80vw', minHeight: '60vh' }}
                                        />
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
