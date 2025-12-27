import { Link } from 'react-router-dom';
import { Utensils, AlertCircle, Home, Gamepad2, WashingMachine, Image as ImageIcon } from 'lucide-react';

const UserDashboard = () => {
    const DashboardCard = ({ title, icon: Icon, link, color }) => (
        <Link to={link} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition border border-gray-100 flex flex-col items-center text-center group">
            <div className={`p-4 rounded-full ${color} bg-opacity-10 mb-3 group-hover:scale-110 transition duration-300`}>
                <Icon size={32} className={color.replace('bg-', 'text-')} />
            </div>
            <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
        </Link>
    );

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome, Student</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <DashboardCard title="My Room" icon={Home} link="/dashboard/rooms" color="bg-blue-500" />
                <DashboardCard title="Food Menu" icon={Utensils} link="/dashboard/food" color="bg-orange-500" />
                <DashboardCard title="Laundry" icon={WashingMachine} link="/dashboard/laundry" color="bg-cyan-500" />
                <DashboardCard title="Complaints" icon={AlertCircle} link="/dashboard/complaints" color="bg-red-500" />
                <DashboardCard title="Gallery" icon={ImageIcon} link="/dashboard/gallery" color="bg-pink-500" />
                <DashboardCard title="Games" icon={Gamepad2} link="/dashboard/games" color="bg-purple-500" />
            </div>
        </div>
    );
};

export default UserDashboard;