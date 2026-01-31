import { useContext, useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Logo from '/logo192.png';
import { AuthContext } from '../../context/AuthContext';

const UserLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useContext(AuthContext);
    const { isDark, toggleTheme } = useTheme();
    const [scrolled, setScrolled] = useState(false);


    // Navbar scroll effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/user/dashboard");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col font-sans text-gray-900 dark:text-gray-100">
            
            {/* --- PREMIUM GLASS NAVBAR --- */}
            <nav className={`fixed top-0 left-0 right-0 z-50 ${
                scrolled 
                    ? 'bg-indigo-50/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg border-b border-indigo-200/60 dark:border-gray-700/50' 
                    : 'bg-indigo-50/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-indigo-200/40 dark:border-gray-700/30'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 sm:h-24 flex justify-between items-center">
                    
                    {/* Brand Logo + myHostel Wordmark */}
                    <Link to="/user/dashboard" className="flex items-center gap-3 group select-none">
                        <img src={Logo} alt="myHostel" className="h-10 w-10 sm:h-12 sm:w-12" draggable="false" loading="eager" />
                        <span className="text-[19px] sm:text-[20px] font-semibold tracking-tight">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">my</span>
                            <span className="text-gray-900 dark:text-gray-100">Hostel</span>
                        </span>
                    </Link>
                    
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Notifications Icon: Only show if logged in */}
                        {user && (
                            <Link to="/user/notifications" className="group p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700" title="Notifications">
                                <svg className="w-5 h-5 text-indigo-600 group-hover:text-indigo-800 dark:text-indigo-400 dark:group-hover:text-indigo-200 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </Link>
                        )}
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 group relative overflow-hidden"
                            aria-label="Toggle theme"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            {isDark ? (
                                <svg className="w-5 h-5 text-yellow-500 transform group-hover:rotate-180 transition-transform duration-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-indigo-600 transform group-hover:-rotate-12 transition-transform duration-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                </svg>
                            )}
                        </button>

                        {user ? (
                            /* --- LOGGED IN STATE --- */
                            <div className="flex items-center gap-2 sm:gap-4">
                                {/* Profile Circle Link */}
                                <Link 
                                    to="/user/profile" 
                                    className="flex items-center gap-2 sm:gap-3 pl-3 sm:pl-4 border-l border-gray-300 dark:border-gray-600 group cursor-pointer"
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                                        <div className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white/50 dark:ring-gray-800/50 group-hover:scale-110 transition-all duration-300">
                                            {user.firstName ? user.firstName.charAt(0).toUpperCase() : "U"}
                                        </div>
                                    </div>
                                    <div className="hidden md:flex flex-col">
                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {user.firstName}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                            Room {user.roomNumber}
                                        </span>
                                    </div>
                                </Link>
                                
                                <button 
                                    onClick={handleLogout} 
                                    className="group p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 relative overflow-hidden"
                                    title="Logout"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="relative w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            /* --- LOGGED OUT STATE --- */
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Login
                                </Link>
                                <Link to="/register" className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 ring-1 ring-indigo-500/10 shadow-sm hover:shadow transition-colors">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content Area with Smooth Animations */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 pt-24 sm:pt-28 animate-fade-in-up bg-gradient-to-br from-gray-50 via-gray-100 to-slate-100 dark:from-gray-900 dark:to-gray-950 min-h-screen">
                <Outlet context={{ user }} />
            </main>
        </div>
    );
};

export default UserLayout;