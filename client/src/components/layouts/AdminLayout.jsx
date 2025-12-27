import { Outlet, Link } from 'react-router-dom';
import Logo from '../../assets/logo.svg';

const AdminLayout = () => {
    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-slate-800 text-white flex flex-col">
                <div className="p-4 border-b border-slate-700 flex items-center gap-3">
                    <img src={Logo} alt="myHostel" className="h-8 w-8" />
                    <span className="text-lg font-semibold">myHostel Admin</span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/admin" className="block p-3 hover:bg-slate-700 rounded">Dashboard</Link>
                    <Link to="/admin/rooms" className="block p-3 hover:bg-slate-700 rounded">Manage Rooms</Link>
                </nav>
            </aside>

            <main className="flex-1 overflow-y-auto p-8">
                <Outlet />
            </main>
        </div>
    );
};
export default AdminLayout;