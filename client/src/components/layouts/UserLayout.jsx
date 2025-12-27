import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Menu, X, User, LogOut } from 'lucide-react'; // Icons

const UserLayout = () => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Helper to highlight active link
    const NavLink = ({ to, label }) => {
        const isActive = location.pathname === to;
        return (
            <Link 
                to={to} 
                className={`block px-4 py-2 rounded-md transition ${isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setIsMobileMenuOpen(false)}
            >
                {label}
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Navbar */}
            <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link to="/dashboard" className="text-2xl font-bold text-blue-600 tracking-tight">
                                Hostel<span className="text-gray-800">Life</span>
                            </Link>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-4">
                            <NavLink to="/dashboard" label="Home" />
                            <NavLink to="/dashboard/food" label="Food Menu" />
                            <NavLink to="/dashboard/complaints" label="Complaints" />
                            <NavLink to="/dashboard/rooms" label="My Room" />
                            
                            <div className="h-6 w-px bg-gray-300 mx-2"></div>
                            
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                                <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-600 transition">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex items-center md:hidden">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600">
                                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <NavLink to="/dashboard" label="Home" />
                            <NavLink to="/dashboard/food" label="Food Menu" />
                            <NavLink to="/dashboard/complaints" label="Complaints" />
                            <NavLink to="/dashboard/rooms" label="My Room" />
                            <div className="border-t my-2"></div>
                            <button 
                                onClick={handleLogout}
                                className="w-full text-left block px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded-md"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Page Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default UserLayout;