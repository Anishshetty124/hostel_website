import { Link, useOutletContext } from "react-router-dom";
import { Utensils, Image as ImageIcon, WashingMachine, Home, Gamepad2, Megaphone } from "lucide-react";

const UserDashboard = () => {
  const { user } = useOutletContext();

  const modules = [
    {
      title: "Food Menu",
      desc: "Check today's mess menu",
      path: "/user/food",
      accentGradient: "from-orange-400 to-amber-500",
      badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200",
      iconText: "text-orange-500",
      icon: Utensils,
    },
    {
      title: "Gallery",
      desc: "Hostel events & memories",
      path: "/user/gallery",
      accentGradient: "from-purple-400 to-pink-500",
      badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200",
      iconText: "text-purple-500",
      icon: ImageIcon,
    },
    {
      title: "Laundry",
      desc: "Book slots & check status",
      path: "/user/laundry",
      accentGradient: "from-blue-400 to-cyan-500",
      badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200",
      iconText: "text-blue-500",
      icon: WashingMachine,
    },
    {
      title: "My Room",
      desc: "Room details & complaints",
      path: "/user/rooms",
      accentGradient: "from-emerald-400 to-green-500",
      badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200",
      iconText: "text-green-500",
      icon: Home,
    },
    {
      title: "Games",
      desc: "TT, Badminton & more",
      path: "/user/games",
      accentGradient: "from-pink-400 to-rose-500",
      badge: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-200",
      iconText: "text-pink-500",
      icon: Gamepad2,
    },
    {
      title: "Complaints",
      desc: "Raise issues",
      path: "/user/complaints",
      accentGradient: "from-red-400 to-orange-500",
      badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200",
      iconText: "text-red-500",
      icon: Megaphone,
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Welcome Banner (only when logged in) */}
      {user && (
        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-sm shadow-gray-200/70 dark:shadow-none border border-gray-200 dark:border-gray-700 p-6 transition-colors">
          <div className="absolute -right-10 -top-10 h-36 w-36 bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-600/20 dark:to-purple-600/20 rounded-full blur-3xl"></div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Hello, {user.firstName}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Welcome to your hostel dashboard. What would you like to do today?
          </p>
        </div>
      )}

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {modules.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="group relative overflow-hidden bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md shadow-slate-300/60 dark:shadow-none border border-slate-300 dark:border-gray-700 hover:shadow-lg transition-all duration-300 flex items-start gap-4"
          >
            <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${item.accentGradient} opacity-10 group-hover:opacity-20 blur-2xl transition-opacity`}></div>

            <div className="relative z-10">
              <div className={`p-3 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 w-fit mb-3 text-lg ${item.iconText} group-hover:scale-110 transition-transform`}>
                {(() => {
                  const Icon = item.icon;
                  return <Icon size={28} />;
                })()}
              </div>

              <h3 className="font-semibold text-lg md:text-xl tracking-tight text-gray-900 dark:text-white">{item.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>

              <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full border border-transparent ${item.badge}`}>
                Quick access
              </div>
            </div>

            {/* Arrow Icon */}
            <div className="relative z-10 text-gray-300 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ml-auto">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;