import { Link } from 'react-router-dom';
import { Utensils, AlertCircle, Home, Gamepad2, WashingMachine, Image as ImageIcon, ChevronRight, Bell } from 'lucide-react';

const UserDashboard = () => {
    // Current Date Formatter
    const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    // Premium Card Component
    const ServiceCard = ({ title, desc, icon: Icon, link, color, delay }) => (
        <Link 
            to={link} 
            className="group relative overflow-hidden bg-white p-6 rounded-2xl border border-slate-200/60 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col justify-between h-48"
        >
            {/* Soft Background Gradient Effect */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-[0.08] rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500`} />

            {/* Header: Icon & Arrow */}
            <div className="flex justify-between items-start z-10">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} bg-opacity-10 text-slate-700 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} className="text-gray-800" strokeWidth={2} />
                </div>
                <div className="text-slate-300 group-hover:text-slate-600 transition-colors">
                    <ChevronRight size={20} />
                </div>
            </div>

            {/* Footer: Text */}
            <div className="z-10 mt-auto">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors mb-1">
                    {title}
                </h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    {desc}
                </p>
            </div>
        </Link>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-10 pt-4 pb-12">
            {/* HEADER SECTION */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <p className="text-slate-500 font-medium text-sm uppercase tracking-wider mb-1">{date}</p>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Dashboard
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-600 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                        Room 302
                    </span>
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                        <Bell size={24} />
                    </button>
                </div>
            </header>

            {/* BENTO GRID LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <ServiceCard 
                    title="My Room" 
                    desc="Roommates, inventory & status." 
                    icon={Home} 
                    link="/dashboard/rooms" 
                    color="from-blue-100 to-indigo-100" 
                />
                <ServiceCard 
                    title="Mess Menu" 
                    desc="Breakfast, Lunch & Dinner schedule." 
                    icon={Utensils} 
                    link="/dashboard/food" 
                    color="from-orange-100 to-amber-100" 
                />
                <ServiceCard 
                    title="Laundry" 
                    desc="Check machines & book slots." 
                    icon={WashingMachine} 
                    link="/dashboard/laundry" 
                    color="from-cyan-100 to-sky-100" 
                />
                <ServiceCard 
                    title="Complaints" 
                    desc="Raise issues directly to warden." 
                    icon={AlertCircle} 
                    link="/dashboard/complaints" 
                    color="from-red-100 to-rose-100" 
                />
                <ServiceCard 
                    title="Community Gallery" 
                    desc="Photos from recent hostel events." 
                    icon={ImageIcon} 
                    link="/dashboard/gallery" 
                    color="from-violet-100 to-purple-100" 
                />
                <ServiceCard 
                    title="Game Zone" 
                    desc="Find players for Chess & Ludo." 
                    icon={Gamepad2} 
                    link="/dashboard/games" 
                    color="from-emerald-100 to-green-100" 
                />
            </div>
        </div>
    );
};

export default UserDashboard;