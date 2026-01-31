import { useState, useRef } from "react";
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import Logo from "../assets/logo.svg";
import { FormInputSkeleton } from "../components/SkeletonLoaders";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    roomNumber: "",
  });
  const [status, setStatus] = useState({ loading: false, error: null });
  const [showRoomLookup, setShowRoomLookup] = useState(false);
  const [roomQuery, setRoomQuery] = useState("");
  const [roomMembers, setRoomMembers] = useState([]);
  const [roomStatus, setRoomStatus] = useState({ loading: false, error: null });
  const [roomSearched, setRoomSearched] = useState(false);
  const roomCacheRef = useRef({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    if (status.error) setStatus({ loading: false, error: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName.trim()) {
      setStatus({ loading: false, error: "First name is required." });
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setStatus({ loading: false, error: "Please enter a valid email address." });
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setStatus({ loading: false, error: "Password must be at least 6 characters." });
      return;
    }
    if (!formData.roomNumber.trim()) {
      setStatus({ loading: false, error: "Room number is required." });
      return;
    }
    
    setStatus({ loading: true, error: null });

    try {
      await api.post("/api/auth/register", formData);
      // Reset form after successful registration
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        roomNumber: "",
      });
      navigate("/login");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Registration failed.";
      setStatus({ loading: false, error: errorMessage });
      toast.error("Registration failed. Please check your name in the hostel record. It may be different from your real name.");
      console.error("[Register] Registration error:", err, errorMessage);
    }
  };

  const fetchRoomMembers = async () => {
    const query = (roomQuery || formData.roomNumber || "").trim();
    if (!query) {
      setRoomStatus({ loading: false, error: "Enter a room number" });
      setRoomMembers([]);
      return;
    }
    const key = query;
    // Serve cached results if available
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
      const res = await api.get(`/api/auth/room-members`, { params: { roomNumber: query } });
      // Support both array and object response
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
      console.error('[Register] Room member fetch error:', error, msg);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 px-4 py-10 transition-colors duration-300">

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800/50 shadow-2xl">
        {/* Brand / Visual Panel */}
        <div className="relative hidden md:flex bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 dark:from-indigo-600 dark:via-indigo-700 dark:to-purple-900 items-center justify-center p-10 overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white_2px,transparent_2px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl"></div>
          <div className="relative flex flex-col items-center text-white text-center gap-4 z-10">
            <img src={Logo} alt="myHostel" className="h-16 w-16 drop-shadow-xl" />
            <h2 className="text-3xl font-semibold tracking-tight">Create your myHostel account</h2>
            <p className="text-white/80 text-sm max-w-sm">Verify details with hostel records; get access to student services.</p>
          </div>
        </div>

        {/* Form Panel */}
        <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm p-8 md:p-12 flex flex-col justify-center overflow-y-auto">
          <button 
            onClick={() => navigate('/user/dashboard')}
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium transition-colors w-fit"
          >
            <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>

          <div className="mt-6 mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight">Verify & Register</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Match your details with hostel records to continue.</p>
          </div>

          {status.error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-xl text-red-600 dark:text-red-400 text-sm text-center font-medium animate-pulse">
              {status.error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField 
                id="firstName" 
                label="First Name (For Verification)" 
                placeholder="John" 
                value={formData.firstName} 
                onChange={handleChange} 
                required={true}
              />
              <InputField 
                id="lastName" 
                label="Last Name (Optional)" 
                placeholder="Doe" 
                value={formData.lastName} 
                onChange={handleChange} 
                required={false}
              />
            </div>

            <InputField 
              id="roomNumber" 
              label="Room Number" 
              placeholder="e.g. 101" 
              value={formData.roomNumber} 
              onChange={handleChange} 
            />

            <div className="mb-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Check your name in hostel record</span>
                <button
                  type="button"
                  onClick={() => { setRoomQuery(formData.roomNumber || roomQuery); setRoomSearched(false); setShowRoomLookup(true); }}
                  className="block w-full text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium underline decoration-dotted text-left"
                >
                  Check room members
                </button>
              </div>
            </div>

            <InputField 
              id="email" 
              type="email" 
              label="Email Address" 
              placeholder="john@example.com" 
              value={formData.email} 
              onChange={handleChange} 
            />

            <PasswordInput 
              id="password" 
              label="Password" 
              placeholder="••••••••" 
              value={formData.password} 
              onChange={handleChange} 
            />

            <button
              type="submit"
              disabled={status.loading}
              className={`w-full py-3.5 px-4 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg ${
                status.loading ? "bg-indigo-400 cursor-not-allowed shadow-indigo-400/30" : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-600/30 hover:shadow-lg hover:shadow-indigo-600/40"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                {status.loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  <>Verify & Create Account</>
                )}
              </span>
            </button>
          </form>

          {showRoomLookup && (
            <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 p-0 sm:p-4" onClick={() => { setShowRoomLookup(false); setRoomSearched(false); }}>
              <div className="w-full sm:max-w-md bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-xl shadow-xl mt-0 sm:mb-0 max-h-[80vh] overflow-y-auto" style={{marginTop: 'env(safe-area-inset-top,0)'}} onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800" style={{ position: 'sticky', top: 0, zIndex: 60 }}>
                  <h3 className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Names in hostel records</h3>
                  <button type="button" aria-label="Close" onClick={() => { setShowRoomLookup(false); setRoomSearched(false); }} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <input
                      type="text"
                      value={roomQuery}
                      onChange={(e) => setRoomQuery(e.target.value)}
                      placeholder="Enter room number"
                      className="flex-1 bg-white dark:bg-gray-900/50 border-2 border-indigo-200 dark:border-indigo-800/50 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400"
                      style={{ position: 'sticky', top: 48, zIndex: 59 }}
                    />
                    <button type="button" onClick={fetchRoomMembers} disabled={roomStatus.loading} className={`px-4 py-2 rounded-lg text-white text-sm font-semibold ${roomStatus.loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>Lookup</button>
                  </div>
                  {roomStatus.error && (
                    <p className="mt-2 text-xs text-red-600 dark:text-red-400">{roomStatus.error}</p>
                  )}
                  <div className="mt-3">
                    {roomStatus.loading ? (
                      <p className="text-sm text-gray-600 dark:text-gray-400">Fetching members...</p>
                    ) : !roomSearched ? (
                      <p className="text-xs text-gray-600 dark:text-gray-400">Enter a room number and tap Lookup.</p>
                    ) : roomMembers.length > 0 ? (
                      <ul className="divide-y divide-gray-100 dark:divide-gray-700 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                        {roomMembers.map((m, idx) => (
                          <li key={idx} className="px-3 py-2 text-sm">
                            <span className="text-gray-800 dark:text-gray-200">{m.firstName}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-600 dark:text-gray-400">No members found for this room.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-gray-500 dark:text-gray-400 text-sm">
            Already verified?{" "}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Light Theme Input Components ---

const InputField = ({ id, type = "text", label, placeholder, value, onChange, required = true }) => (
  <div>
    <label htmlFor={id} className="block text-gray-700 dark:text-gray-300 text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">
      {label}
    </label>
    <input
      type={type}
      id={id}
      required={required}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-indigo-50/30 dark:bg-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-800/50 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-900/40 transition-all duration-200"
    />
  </div>
);

const PasswordInput = ({ id, label, placeholder, value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="block text-gray-700 dark:text-gray-300 text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id={id}
          required
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 pr-12 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gray-500 dark:focus:border-gray-400 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-900/40 transition-all duration-200"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default Register;