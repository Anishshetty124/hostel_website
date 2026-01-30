import { useState, useContext, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Logo from "../assets/logo.svg";
import { AuthContext } from "../context/AuthContext";
import { FormInputSkeleton } from "../components/SkeletonLoaders";

const Login = () => {
  // Use 'identifier' to allow Name OR Email
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [status, setStatus] = useState({ loading: false, error: null });
  const [showRoomLookup, setShowRoomLookup] = useState(false);
  const [roomQuery, setRoomQuery] = useState("");
  const [roomMembers, setRoomMembers] = useState([]);
  const [roomStatus, setRoomStatus] = useState({ loading: false, error: null });
  const [roomSearched, setRoomSearched] = useState(false);
  const roomCacheRef = useRef({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    // Clear errors when user types
    if (status.error) setStatus({ loading: false, error: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.identifier.trim()) {
      setStatus({ loading: false, error: "Please enter email or first name." });
      return;
    }
    if (!formData.password) {
      setStatus({ loading: false, error: "Please enter your password." });
      return;
    }
    
    setStatus({ loading: true, error: null });
    try {
      const result = await login(formData.identifier, formData.password);
      if (result.success) {
        // Redirect based on role
        try {
          const stored = localStorage.getItem('userInfo');
          const parsed = stored ? JSON.parse(stored) : null;
          const role = parsed?.user?.role;
          if (role === 'admin') {
            navigate('/admin');
          } else {
            const from = location.state?.from || '/user/dashboard';
            navigate(from);
          }
        } catch {
          navigate('/user/dashboard');
        }
      } else {
        setStatus({ loading: false, error: result.message || "Login failed" });
      }
    } catch (error) {
      setStatus({ loading: false, error: "Login failed" });
    }
  };

  const fetchRoomMembers = async () => {
    if (!roomQuery.trim()) {
      setRoomStatus({ loading: false, error: "Enter a room number" });
      setRoomMembers([]);
      return;
    }
    const key = roomQuery.trim();
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
      const res = await api.get(`/api/auth/room-members`, { params: { roomNumber: roomQuery.trim() } });
      const members = res.data?.members || [];
      roomCacheRef.current[key] = members;
      setRoomMembers(members);
      setRoomStatus({ loading: false, error: null });
    } catch (error) {
      const msg = error.response?.data?.message || "Could not fetch room members";
      setRoomStatus({ loading: false, error: msg });
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
            <h2 className="text-3xl font-semibold tracking-tight">Welcome to myHostel</h2>
            <p className="text-white/80 text-sm max-w-sm">Manage rooms, view menus, and stay on top of campus life.</p>
          </div>
        </div>

        {/* Form Panel */}
        <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm p-8 md:p-12 flex flex-col justify-center">
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight">Sign in to your account</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Use your email and password</p>
          </div>

          {status.error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-xl text-red-600 dark:text-red-400 text-sm text-center font-medium flex items-center gap-2 justify-center animate-pulse">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {status.error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="group">
              <label htmlFor="identifier" className="block text-gray-700 dark:text-gray-300 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                Email or First Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="identifier"
                  required
                  autoComplete="username"
                  value={formData.identifier}
                  onChange={handleChange}
                  placeholder="John or john@example.com"
                  className="w-full bg-indigo-50/30 dark:bg-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-800/50 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-900/40 transition-all duration-200"
                />
              </div>
            </div>

            <div className="group">
              <div className="flex justify-between items-center mb-2 ml-1">
                <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 text-xs font-bold uppercase tracking-wider">
                  Password
                </label>
                <div className="flex items-center gap-3">
                  <Link to="/forgot-password" className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors font-medium">Forgot?</Link>
                  {status.error && (
                    <button type="button" onClick={() => { setShowRoomLookup((v) => !v); setRoomSearched(false); }} className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium underline decoration-dotted">
                      Check room members
                    </button>
                  )}
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-300 dark:border-gray-600 rounded-xl pl-12 pr-12 py-3.5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gray-500 dark:focus:border-gray-400 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-900/40 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
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

            <button
              type="submit"
              disabled={status.loading}
              className={`w-full py-3.5 px-4 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg ${
                status.loading ? "bg-indigo-400 cursor-not-allowed shadow-indigo-400/30" : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-600/30 hover:shadow-lg hover:shadow-indigo-600/40"
              }`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {status.loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  <>Sign In</>
                )}
              </span>
            </button>
          </form>

          {showRoomLookup && (
            <div className="mt-6 border border-indigo-200 dark:border-indigo-800/50 rounded-xl p-4 bg-indigo-50/30 dark:bg-indigo-950/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Find names in hostel records</h3>
                <button type="button" aria-label="Close" onClick={() => { setShowRoomLookup(false); setRoomSearched(false); }} className="p-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  value={roomQuery}
                  onChange={(e) => setRoomQuery(e.target.value)}
                  placeholder="Enter room number (e.g. 101)"
                  className="flex-1 bg-white dark:bg-gray-900/50 border-2 border-indigo-200 dark:border-indigo-800/50 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400"
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
                  <ul className="divide-y divide-indigo-100 dark:divide-indigo-900/50 rounded-lg overflow-hidden border border-indigo-100 dark:border-indigo-900/50">
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
          )}

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Don’t have an account? {" "}
            <Link to="/register" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;