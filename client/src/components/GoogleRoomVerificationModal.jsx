import { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import api from "../utils/api";
import { LoadingSpinner } from "./LoadingSpinner";

export const GoogleRoomVerificationModal = ({
  isOpen,
  googleData,
  onVerified,
  onCancel,
}) => {
  const [roomNumber, setRoomNumber] = useState("");
  const [roomMembers, setRoomMembers] = useState([]);
  const [roomStatus, setRoomStatus] = useState({ loading: false, error: null });
  const [roomSearched, setRoomSearched] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState({ loading: false, error: null });
  const roomCacheRef = useRef({});

  const fetchRoomMembers = async () => {
    if (!roomNumber.trim()) {
      setRoomStatus({ loading: false, error: "Enter a room number" });
      setRoomMembers([]);
      return;
    }
    const key = roomNumber.trim();
    // Serve from cache if available
    if (roomCacheRef.current[key]) {
      setRoomMembers(roomCacheRef.current[key]);
      setRoomSearched(true);
      setRoomStatus({ loading: false, error: null });
      return;
    }
    setRoomSearched(true);
    setRoomStatus({ loading: true, error: null });
    setRoomMembers([]);
    try {
      const res = await api.get(`/auth/room-members`, {
        params: { roomNumber: roomNumber.trim() },
      });
      let members = [];
      if (Array.isArray(res.data)) {
        members = res.data;
      } else if (res.data && Array.isArray(res.data.members)) {
        members = res.data.members;
      }
      roomCacheRef.current[key] = members;
      setRoomMembers(members);
      setRoomStatus({ loading: false, error: null });
    } catch (error) {
      const msg = error.response?.data?.message || "Could not fetch room members";
      setRoomStatus({ loading: false, error: msg });
    }
  };

  const handleVerifyRoom = async () => {
    if (!roomNumber.trim()) {
      setVerifyStatus({ loading: false, error: "Room number is required" });
      return;
    }

    setVerifyStatus({ loading: true, error: null });
    try {
      const response = await api.post("/auth/google-verify-room", {
        email: googleData.email,
        firstName: googleData.firstName,
        lastName: googleData.lastName,
        roomNumber: roomNumber.trim(),
        picture: googleData.picture,
      });

      if (response.data.token) {
        toast.success("Google verification successful!");
        onVerified(response.data);
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Verification failed";
      setVerifyStatus({ loading: false, error: msg });
      toast.error(msg);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Verify Your Room
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Welcome {googleData?.firstName}! Please enter your room number to verify
          your identity.
        </p>

        {/* Room Number Input */}
        <div className="mb-4">
          <label htmlFor="room" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Room Number
          </label>
          <input
            id="room"
            type="text"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            placeholder="e.g., 101, 202"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Fetch Room Members Button */}
        <button
          onClick={fetchRoomMembers}
          disabled={roomStatus.loading}
          className="w-full mb-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {roomStatus.loading && <LoadingSpinner />}
          {roomStatus.loading ? "Searching..." : "Search Room Members"}
        </button>

        {roomStatus.error && (
          <p className="text-sm text-red-600 dark:text-red-400 mb-3 bg-red-50 dark:bg-red-900/30 p-2 rounded">
            {roomStatus.error}
          </p>
        )}

        {/* Room Members List */}
        {roomSearched && roomMembers.length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Room Members:
            </p>
            <ul className="space-y-1">
              {roomMembers.map((member, idx) => (
                <li
                  key={idx}
                  className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      member.firstName?.toLowerCase() ===
                      googleData.firstName?.toLowerCase()
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  ></span>
                  {member.fullName || member.firstName} (
                  {member.firstName ? `First Name: ${member.firstName}` : "N/A"})
                </li>
              ))}
            </ul>
          </div>
        )}

        {roomSearched && roomMembers.length === 0 && !roomStatus.error && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            No members found in this room.
          </p>
        )}

        {verifyStatus.error && (
          <p className="text-sm text-red-600 dark:text-red-400 mb-3 bg-red-50 dark:bg-red-900/30 p-2 rounded">
            {verifyStatus.error}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={verifyStatus.loading}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleVerifyRoom}
            disabled={verifyStatus.loading || !roomNumber.trim()}
            className="flex-1 h-10 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {verifyStatus.loading && <LoadingSpinner />}
            <span className="inline-block min-w-[120px] text-center">
              {verifyStatus.loading ? "Verifying..." : "Verify & Sign In"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
