import { Link } from 'react-router-dom';
import { Utensils, AlertCircle, Home, Gamepad2, WashingMachine } from 'lucide-react'; // Icons

const UserDashboard = () => {
    // Quick Action Card Component
    const DashboardCard = ({ title, icon: Icon, link, color }) => (
        <Link to={link} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col items-center text-center group">
            <div className={`p-4 rounded-full ${color} bg-opacity-10 mb-4 group-hover:scale-110 transition duration-300`}>
                <Icon size={32} className={color.replace('bg-', 'text-')} />
            </div>
            <h3 className="font-semibold text-gray-800">{title}</h3>
        </Link>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500">Welcome to your hostel management portal.</p>
                </div>
            </div>

            {/* Grid Layout for Features */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <DashboardCard title="My Room" icon={Home} link="/dashboard/rooms" color="bg-blue-500" />
                <DashboardCard title="Food Menu" icon={Utensils} link="/dashboard/food" color="bg-orange-500" />
                <DashboardCard title="Complaints" icon={AlertCircle} link="/dashboard/complaints" color="bg-red-500" />
                <DashboardCard title="Laundry" icon={WashingMachine} link="/dashboard/laundry" color="bg-cyan-500" />
                <DashboardCard title="Games" icon={Gamepad2} link="/dashboard/games" color="bg-purple-500" />
            </div>

            {/* Recent Activity / Notices Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Hostel Notices</h2>
                <div className="text-gray-500 italic">No new notices from the Warden.</div>
            </div>
        </div>
    );
};

export default UserDashboard;