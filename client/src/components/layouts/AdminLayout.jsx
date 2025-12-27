import { Outlet, Link } from 'react-router-dom';

const AdminLayout = () => {
    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-slate-800 text-white flex flex-col">
                <div className="p-4 text-xl font-bold border-b border-slate-700">Hostel Admin</div>
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