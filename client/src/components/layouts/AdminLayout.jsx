import { useContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Logo from '../../assets/logo.svg';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const AdminLayout = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const { isDark, toggleTheme } = useTheme();

    const handleLogout = () => {
        logout();
        navigate('/user/dashboard');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 text-slate-900 dark:text-gray-100 flex flex-col">
            {/* Top bar */}
            <header className="h-20 lg:h-24 bg-indigo-50/85 dark:bg-gray-900/80 backdrop-blur border-b border-indigo-200/60 dark:border-gray-700 flex items-center justify-between px-4 lg:px-8 shadow-sm sticky top-0 z-30">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                        <img src={Logo} alt="myHostel" className="h-9 w-9" />
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500">Admin</p>
                            <p className="text-sm font-semibold text-slate-800 dark:text-gray-100">myHostel</p>
                        </div>
                    </button>
                </div>
                <div className="flex items-center gap-2 lg:gap-3 text-sm">
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 group relative overflow-hidden"
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
                    <div className="hidden sm:flex items-center gap-3 text-sm">
                        <div className="text-right">
                            <p className="font-semibold text-slate-800 dark:text-gray-100">{user?.firstName || 'Admin'}</p>
                            <p className="text-slate-500 dark:text-gray-400">{user?.email || 'admin@hostel'}</p>
                        </div>
                        <button onClick={handleLogout} className="px-3 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors">Logout</button>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="sm:hidden px-3 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </header>


            <main className="flex-1 p-4 lg:p-8 overflow-y-auto bg-gradient-to-br from-white via-slate-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
                <div className="max-w-6xl mx-auto space-y-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
export default AdminLayout;