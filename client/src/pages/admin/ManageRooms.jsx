import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';


const ManageRooms = () => {
    const { token } = useContext(AuthContext);
    const [rooms, setRooms] = useState([]);
    const [addData, setAddData] = useState({ roomNumber: '', fullName: '', firstName: '' });
    const [addError, setAddError] = useState(null);
    const [addSuccess, setAddSuccess] = useState(null);
    const [adding, setAdding] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ open: false, action: '', member: null, payload: null });

    // Save member edit handler
    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.put(`/api/rooms/hostelrecords/${editRoomId}`, editData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditRoomId(null);
            setEditData({});
            setSuccess('Saved!');
            // Refresh rooms
            const res = await axios.get('/api/rooms/hostelrecords', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const sorted = [...res.data].sort((a, b) => {
                if (a.roomNumber && b.roomNumber) {
                    return a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true, sensitivity: 'base' });
                }
                return 0;
            });
            setRooms(sorted);
            setTimeout(() => setSuccess(null), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const [searchVar, setSearchVar] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editRoomId, setEditRoomId] = useState(null);
    const [editData, setEditData] = useState({});
    const [success, setSuccess] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [deleteError, setDeleteError] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchRooms = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.get('/api/rooms/hostelrecords', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Sort by roomNumber (alphanumeric sort)
                const sorted = [...res.data].sort((a, b) => {
                    if (a.roomNumber && b.roomNumber) {
                        return a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true, sensitivity: 'base' });
                    }
                    return 0;
                });
                setRooms(sorted);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch rooms');
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, [token]);

    const handleEdit = (room) => {
        setEditRoomId(room._id);
        setEditData({ ...room });
        setSuccess(null);
    };

    const handleChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    // Add member input change handler
    const handleAddChange = (e) => {
        setAddData({ ...addData, [e.target.name]: e.target.value });
    };

    const handleAddMember = (e) => {
        e.preventDefault();
        setConfirmModal({ open: true, action: 'add', member: null, payload: { ...addData } });
    };

    const confirmAdd = async () => {
        setAdding(true);
        setAddError(null);
        setAddSuccess(null);
        setConfirmModal({ open: false, action: '', member: null, payload: null });
        try {
            const res = await axios.post('/api/rooms/hostelrecords', confirmModal.payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAddSuccess('Member added!');
            setAddData({ roomNumber: '', fullName: '', firstName: '' });
            // Refresh rooms
            const res2 = await axios.get('/api/rooms/hostelrecords', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const sorted = [...res2.data].sort((a, b) => {
                if (a.roomNumber && b.roomNumber) {
                    return a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true, sensitivity: 'base' });
                }
                return 0;
            });
            setRooms(sorted);
            setTimeout(() => setAddSuccess(null), 2000);
        } catch (err) {
            setAddError(err.response?.data?.message || 'Failed to add member');
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = (member) => {
        setConfirmModal({ open: true, action: 'delete', member, payload: member._id });
    };

    const confirmDelete = async () => {
        const id = confirmModal.payload;
        setDeletingId(id);
        setDeleteError(null);
        setConfirmModal({ open: false, action: '', member: null, payload: null });
        try {
            await axios.delete(`/api/rooms/hostelrecords/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Member deleted!');
            // Refresh rooms
            const res = await axios.get('/api/rooms/hostelrecords', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const sorted = [...res.data].sort((a, b) => {
                if (a.roomNumber && b.roomNumber) {
                    return a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true, sensitivity: 'base' });
                }
                return 0;
            });
            setRooms(sorted);
            setTimeout(() => setSuccess(null), 2000);
        } catch (err) {
            setDeleteError(err.response?.data?.message || 'Failed to delete member');
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4"></div>
            <div className="text-gray-500 dark:text-gray-300">Loading rooms...</div>
        </div>
    );
    if (error) return <div className="text-center py-10 text-red-500 dark:text-red-400">{error}</div>;

    // Filtered and paginated rooms
    const filteredRooms = rooms.filter(room => {
        const q = searchVar.trim().toLowerCase();
        if (!q) return true;
        return (
            (room.roomNumber && room.roomNumber.toLowerCase().includes(q)) ||
            (room.fullName && room.fullName.toLowerCase().includes(q)) ||
            (room.firstName && room.firstName.toLowerCase().includes(q))
        );
    });
    const totalPages = Math.ceil(filteredRooms.length / pageSize);
    const paginatedRooms = filteredRooms.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div className="max-w-4xl mx-auto p-2 sm:p-4 md:p-8 min-h-screen bg-white dark:bg-gray-900 transition-colors">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100 text-center">Manage Rooms</h1>

            {/* Add Member Section */}
            <div className="mb-2">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">Add Members</h2>
            </div>
            <form onSubmit={handleAddMember} className="mb-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col sm:flex-row gap-3 items-center justify-between border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                                        <select
                                                name="roomNumber"
                                                className="w-full sm:w-32 px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none"
                                                value={addData.roomNumber}
                                                onChange={handleAddChange}
                                                required
                                        >
                                                <option value="">Room Number</option>
                                                {[
                                                    ...Array.from({length: 10}, (_, i) => i + 1),
                                                    ...Array.from({length: 13}, (_, i) => 101 + i),
                                                    ...Array.from({length: 13}, (_, i) => 201 + i),
                                                    ...Array.from({length: 13}, (_, i) => 301 + i),
                                                    ...Array.from({length: 13}, (_, i) => 401 + i),
                                                    ...Array.from({length: 13}, (_, i) => 501 + i),
                                                    ...Array.from({length: 13}, (_, i) => 601 + i)
                                                ].map(num => (
                                                    <option key={num} value={num}>{num}</option>
                                                ))}
                                        </select>
                    <input
                        name="fullName"
                        type="text"
                        className="w-full sm:w-48 px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none"
                        placeholder="Full Name"
                        value={addData.fullName}
                        onChange={handleAddChange}
                        required
                    />
                    <input
                        name="firstName"
                        type="text"
                        className="w-full sm:w-32 px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none"
                        placeholder="First Name (optional)"
                        value={addData.firstName}
                        onChange={handleAddChange}
                    />
                </div>
                <button type="submit" disabled={adding} className={`mt-2 sm:mt-0 px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors ${adding ? 'opacity-60 cursor-not-allowed' : ''}`}>{adding ? <span className="animate-spin h-4 w-4 border-b-2 border-white rounded-full inline-block mr-2"></span> : null}Add Member</button>
            </form>
            {(addError || addSuccess) && (
                <div className={`mb-4 text-center font-semibold ${addError ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{addError || addSuccess}</div>
            )}

            {/* Search and Success */}
            <div className="mb-4 flex flex-col sm:flex-row gap-2 items-center justify-between">
                <div className="relative w-full sm:w-72">
                    <input
                        type="text"
                        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-8"
                        placeholder="Search by room, name..."
                        value={searchVar}
                        onChange={e => { setSearchVar(e.target.value); setPage(1); }}
                    />
                    {searchVar && (
                        <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
                            onClick={() => { setSearchVar(''); setPage(1); }}
                            aria-label="Clear search"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
                {success && <div className="text-green-600 dark:text-green-400 text-center font-semibold">{success}</div>}
            </div>
            {deleteError && <div className="mb-4 text-center text-red-600 dark:text-red-400 font-semibold">{deleteError}</div>}
            {/* Confirmation Modal */}
            {confirmModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-xs sm:max-w-sm flex flex-col items-center">
                        <div className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                            {confirmModal.action === 'delete' ? (
                                <>Are you sure you want to <span className="text-red-600">delete</span> this member?<br /><span className="text-sm text-gray-600 dark:text-gray-300">{confirmModal.member?.fullName} ({confirmModal.member?.roomNumber})</span></>
                            ) : (
                                <>Are you sure you want to <span className="text-green-600">add</span> this member?<br /><span className="text-sm text-gray-600 dark:text-gray-300">{confirmModal.payload?.fullName} ({confirmModal.payload?.roomNumber})</span></>
                            )}
                        </div>
                        <div className="flex gap-4 mt-2">
                            <button
                                className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold"
                                onClick={() => setConfirmModal({ open: false, action: '', member: null, payload: null })}
                            >Cancel</button>
                            {confirmModal.action === 'delete' ? (
                                <button
                                    className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold"
                                    onClick={confirmDelete}
                                    disabled={deletingId === confirmModal.member?._id}
                                >{deletingId === confirmModal.member?._id ? 'Deleting...' : 'Delete'}</button>
                            ) : (
                                <button
                                    className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-semibold"
                                    onClick={confirmAdd}
                                    disabled={adding}
                                >{adding ? 'Adding...' : 'Add'}</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <table className="min-w-full w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <th className="p-2 sm:p-3 text-left font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">Room Number</th>
                            <th className="p-2 sm:p-3 text-left font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">Full Name</th>
                            <th className="p-2 sm:p-3 text-left font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">First Name</th>
                            <th className="p-2 sm:p-3 text-left font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                        {paginatedRooms.map(room => (
                            <tr key={room._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <td className="p-2 sm:p-3 align-middle max-w-[120px] truncate">
                                    {editRoomId === room._id ? (
                                                                                <select name="roomNumber" value={editData.roomNumber || ''} onChange={handleChange} className="border rounded px-2 py-1 w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                                                                                        <option value="">Room Number</option>
                                                                                        {[
                                                                                            ...Array.from({length: 10}, (_, i) => i + 1),
                                                                                            ...Array.from({length: 13}, (_, i) => 101 + i),
                                                                                            ...Array.from({length: 13}, (_, i) => 601 + i)
                                                                                        ].map(num => (
                                                                                            <option key={num} value={num}>{num}</option>
                                                                                        ))}
                                                                                </select>
                                    ) : (
                                        <span className="text-gray-900 dark:text-gray-100 break-all">{room.roomNumber}</span>
                                    )}
                                </td>
                                <td className="p-2 sm:p-3 align-middle max-w-[180px] truncate">
                                    {editRoomId === room._id ? (
                                        <input name="fullName" value={editData.fullName || ''} onChange={handleChange} className="border rounded px-2 py-1 w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
                                    ) : (
                                        <span className="text-gray-800 dark:text-gray-200 break-all">{room.fullName}</span>
                                    )}
                                </td>
                                <td className="p-2 sm:p-3 align-middle max-w-[120px] truncate">
                                    {editRoomId === room._id ? (
                                        <input name="firstName" value={editData.firstName || ''} onChange={handleChange} className="border rounded px-2 py-1 w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
                                    ) : (
                                        <span className="text-gray-700 dark:text-gray-300 break-all">{room.firstName}</span>
                                    )}
                                </td>
                                <td className="p-2 sm:p-3 align-middle min-w-[160px]">
                                    {editRoomId === room._id ? (
                                        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                                            <button onClick={handleSave} disabled={saving} className={`bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition-colors flex items-center justify-center ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}>
                                                {saving ? <span className="animate-spin h-4 w-4 border-b-2 border-white rounded-full mr-2"></span> : null}
                                                Save
                                            </button>
                                            <button onClick={() => setEditRoomId(null)} disabled={saving} className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 px-3 py-1 rounded transition-colors">Cancel</button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                                            <button onClick={() => handleEdit(room)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors">Edit</button>
                                            <button onClick={() => handleDelete(room)} disabled={deletingId === room._id} className={`bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors flex items-center justify-center ${deletingId === room._id ? 'opacity-60 cursor-not-allowed' : ''}`}>
                                                {deletingId === room._id ? <span className="animate-spin h-4 w-4 border-b-2 border-white rounded-full mr-2"></span> : null}
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-4 mt-6">
                <button
                    className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold disabled:opacity-50"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                >
                    Previous
                </button>
                <span className="text-gray-700 dark:text-gray-200">Page {page} of {totalPages}</span>
                <button
                    className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold disabled:opacity-50"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default ManageRooms;