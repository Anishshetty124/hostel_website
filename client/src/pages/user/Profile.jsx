import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { ProfileSkeleton } from "../../components/SkeletonLoaders";

const Profile = () => {
  const { user, token } = useContext(AuthContext); // Use AuthContext instead of outlet
  
  // State for Edit Mode
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || "",
    // Note: Name and Room are displayed but NOT editable here to prevent fraud
  });
  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  // Sync formData with user whenever user changes (e.g., after page reload)
  useEffect(() => {
    if (user?.email) {
      setFormData({ email: user.email });
    }
  }, [user]);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Reset status messages when typing
    if (status.error || status.success) setStatus({ loading: false, error: null, success: null });
  };

  // Handle Form Submit
 const handleUpdate = async () => {
    setStatus({ loading: true, error: null, success: null });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setStatus({ loading: false, error: "You are not logged in.", success: null });
        return;
      }
      
      // Validate email format before sending
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setStatus({ loading: false, error: "Please enter a valid email address.", success: null });
        return;
      }
      
      // 1. Send Update to Backend - use relative URL for correct API endpoint
      const res = await axios.put("/api/auth/update-email", 
        { email: formData.email }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // --- THE FIX: SYNC LOCAL STORAGE ---
      
      // 2. Get the existing user data from storage with error handling
      try {
        const stored = JSON.parse(localStorage.getItem("userInfo") || "{}");
        if (!stored || typeof stored !== 'object') {
          throw new Error('Invalid stored user data');
        }
        
        // 3. Update the email field
        const updatedUserInfo = { ...stored, user: { ...stored.user, ...res.data.user } };
        
        // 4. Save it back to Local Storage
        localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
      } catch (storageErr) {
        // Storage error handled
        setStatus({ loading: false, error: "Failed to update local storage. Please refresh the page.", success: null });
        return;
      }
      
      // 5. Show success message
      setStatus({ loading: false, error: null, success: "Profile updated successfully!" });
      setIsEditing(false);
      
      // 6. Force reload after a short delay to show the success message
      setTimeout(() => window.location.reload(), 1000);
      
      // ------------------------------------
      
    } catch (err) {
      // Error handled
      setStatus({ 
        loading: false, 
        error: err.response?.data?.message || "Failed to update profile.", 
        success: null 
      });
    }
  };

  if (!user) return <ProfileSkeleton />;

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-fade-in-up">
      
      {/* --- PREMIUM HEADER SECTION --- */}
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        {/* Animated Gradient Banner */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
        </div>

        <div className="px-4 sm:px-6 pb-6 sm:pb-8 md:px-10 flex flex-col md:flex-row items-center md:items-end -mt-12 sm:-mt-16 gap-4 sm:gap-6">
          {/* Premium Avatar */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-white dark:bg-gray-800 p-1.5 shadow-2xl ring-4 ring-white/50 dark:ring-gray-700/50 transition-colors">
              <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 text-3xl sm:text-4xl font-bold uppercase transition-colors">
                {user.firstName?.charAt(0)}
              </div>
            </div>
            {/* Status Badge */}
            <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 bg-green-500 h-4 w-4 sm:h-5 sm:w-5 rounded-full border-4 border-white dark:border-gray-800 animate-pulse" title="Active"></div>
          </div>

          {/* User Info */}
          <div className="text-center md:text-left flex-1 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white transition-colors">{user.firstName} {user.lastName}</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mt-1">Room {user.roomNumber}</p>
          </div>

          {/* Action Buttons */}
          <div className="mb-2 sm:mb-4 w-full md:w-auto">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="w-full md:w-auto bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-700 dark:to-gray-600 hover:from-black hover:to-gray-900 dark:hover:from-gray-600 dark:hover:to-gray-500 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                </svg>
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3 w-full md:w-auto">
                 <button 
                  onClick={() => { setIsEditing(false); setFormData({ email: user.email }); setStatus({ error:null, success:null, loading:false }); }}
                  className="flex-1 md:flex-initial bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 px-5 py-2.5 rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdate}
                  disabled={status.loading}
                  className="flex-1 md:flex-initial bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status.loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- STATUS MESSAGES --- */}
      {status.success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl flex items-center gap-2 animate-fade-in">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          {status.success}
        </div>
      )}
      {status.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-xl flex items-center gap-2 animate-fade-in">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {status.error}
        </div>
      )}

      {/* --- DETAILS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Left Card: Personal Info */}
        <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 md:p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 h-full hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg text-blue-600 dark:text-blue-400">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
               </svg>
            </span>
            Personal Details
          </h3>
          
          <div className="space-y-6">
            {/* Read Only Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
              <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 px-4 py-3 rounded-xl font-medium cursor-not-allowed select-none flex justify-between items-center transition-colors">
                {user.firstName} {user.lastName}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400 dark:text-gray-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
            </div>

            {/* Editable Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  name="email"
                  value={formData.email} 
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl font-medium transition-all ${
                    isEditing 
                      ? "bg-white dark:bg-gray-900 border-blue-300 dark:border-blue-600 ring-2 ring-blue-50 dark:ring-blue-900/50 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500" 
                      : "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                  } border`}
                />
                {!isEditing && (
                   <div className="absolute right-4 top-3.5 text-gray-400 dark:text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                   </div>
                )}
              </div>
              {isEditing && <p className="text-xs text-blue-500 dark:text-blue-400 mt-2">You can update your contact email here.</p>}
            </div>
          </div>
        </div>

        {/* Right Card: Room Info */}
        <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 md:p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 h-full flex flex-col hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-lg text-purple-600 dark:text-purple-400">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
               </svg>
            </span>
            Hostel Allocation
          </h3>

          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900/50 dark:to-blue-900/10 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 transition-colors">
            <div className="mb-4">
              <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 animate-float">{user.roomNumber}</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm sm:text-base">Current Room Number</p>
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-xs font-semibold rounded-full border border-yellow-200 dark:border-yellow-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Contact Warden to change room
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;