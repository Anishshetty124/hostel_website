import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MessageSquare, Home, Users } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const cards = [
    {
        title: 'Complaints',
        desc: 'Review, reply, and resolve issues raised by residents.',
        to: '/admin/complaints',
        icon: MessageSquare,
        accent: 'from-indigo-500 to-blue-500',
    },
    {
        title: 'Manage Rooms',
        desc: 'View occupancy and room change requests.',
        to: '/admin/rooms',
        icon: Home,
        accent: 'from-emerald-500 to-teal-500',
    },
    {
        title: 'Change Food Menu',
        desc: 'Temporarily or permanently update the mess timetable.',
        to: '/admin/food-menu',
        icon: ShieldCheck,
        accent: 'from-purple-500 to-pink-500',
    },
    {
        title: 'Residents',
        desc: 'At a glance: residents and activity.',
        to: '/admin/complaints',
        icon: Users,
        accent: 'from-amber-500 to-orange-500',
    },
];

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden bg-white/80 dark:bg-gray-900/70 backdrop-blur rounded-2xl border border-slate-200/70 dark:border-gray-800 shadow-lg shadow-indigo-200/40 dark:shadow-none p-6">
                <div className="absolute -right-12 -top-16 h-40 w-40 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 dark:from-indigo-600/20 dark:to-purple-600/20 rounded-full blur-3xl" />
                <div className="absolute -left-16 -bottom-20 h-48 w-48 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 dark:from-blue-500/20 dark:to-cyan-500/20 rounded-full blur-3xl" />
                <div className="relative z-10 space-y-2">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-gray-400">Admin</p>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome back, {user?.firstName || 'Admin'}</h1>
                    <p className="text-slate-600 dark:text-gray-400">Monitor complaints, rooms, and resident activity with the quick actions below.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <Link
                            key={card.title}
                            to={card.to}
                            className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/70 backdrop-blur rounded-2xl border border-slate-200/70 dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow p-5 flex flex-col gap-3"
                        >
                                <div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-20 group-hover:opacity-30 transition-opacity blur-2xl bg-gradient-to-br ${card.accent}`} />
                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${card.accent} text-white shadow`}
                                     style={{ boxShadow: '0 10px 25px rgba(79, 70, 229, 0.15)' }}>
                                <Icon size={22} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{card.title}</h3>
                                <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">{card.desc}</p>
                            </div>
                            <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                Open
                                <span aria-hidden>→</span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminDashboard;