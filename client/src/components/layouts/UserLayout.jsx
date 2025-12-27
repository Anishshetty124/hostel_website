import { Outlet, Link } from 'react-router-dom';

const UserLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar */}
            <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <Link to="/dashboard" className="text-xl font-bold text-blue-600">HostelLife</Link>
                
                <div className="flex items-center gap-4">
                    {/* Dev Mode: Showing Login buttons to match your visual plan */}
                    <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-blue-600">Login</Link>
                    <Link to="/register" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">Register</Link>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-6">
                <Outlet />
            </main>
        </div>
    );
};

export default UserLayout;