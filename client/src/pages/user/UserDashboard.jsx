import { Fragment } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Utensils, Image as ImageIcon, MessageSquare, Home, Gamepad2, Megaphone } from "lucide-react";
import { DashboardGridSkeleton } from "../../components/SkeletonLoaders";

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
      bgLight: "bg-orange-100 dark:bg-orange-950/30",
      icon: Utensils,
    },
    {
      title: "Gallery",
      desc: "Hostel events & memories",
      path: "/user/gallery",
      accentGradient: "from-purple-400 to-pink-500",
      badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200",
      iconText: "text-purple-500",
      bgLight: "bg-purple-100 dark:bg-purple-950/30",
      icon: ImageIcon,
    },
    {
      title: "My Room",
      desc: "Room details & complaints",
      path: "/user/rooms",
      accentGradient: "from-emerald-400 to-green-500",
      badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200",
      iconText: "text-green-500",
      bgLight: "bg-green-100 dark:bg-green-950/30",
      icon: Home,
    },
    {
      title: "Games",
      desc: "TT, Badminton & more",
      path: "/user/games",
      accentGradient: "from-pink-400 to-rose-500",
      badge: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-200",
      iconText: "text-pink-500",
      bgLight: "bg-pink-100 dark:bg-pink-950/30",
      icon: Gamepad2,
    },
    {
      title: "Complaints",
      desc: "Raise issues",
      path: "/user/complaints",
      accentGradient: "from-red-400 to-orange-500",
      badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200",
      iconText: "text-red-500",
      bgLight: "bg-red-100 dark:bg-red-950/30",
      icon: Megaphone,
    },
    {
      title: "Feedback",
      desc: "Share your suggestions",
      path: "/user/laundry",
      accentGradient: "from-blue-400 to-cyan-500",
      badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200",
      iconText: "text-blue-500",
      bgLight: "bg-blue-100 dark:bg-blue-950/30",
      icon: MessageSquare,
    }
  ];

  const primaryModules = modules.slice(0, 2);
  const gatedModules = modules.slice(2);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Welcome Banner (only when logged in) */}
      {!user ? (
        <DashboardGridSkeleton />
      ) : (
        <>
          <div className="relative overflow-hidden bg-white dark:bg-gray-800/60 rounded-2xl shadow-md shadow-gray-300/50 dark:shadow-gray-900/40 dark:border-gray-700/50 border border-gray-200/80 p-6 transition-colors">
            <div className="absolute -right-10 -top-10 h-36 w-36 bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-600/20 dark:to-purple-600/20 rounded-full blur-3xl"></div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Hello, {user.firstName}! 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Welcome to your hostel dashboard. What would you like to do today?
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 px-0 sm:px-2">
            {primaryModules.map((item) => (
              <Link
                key={item.title}
                to={item.path}
                className={`group relative overflow-hidden ${item.bgLight} p-6 rounded-2xl shadow-lg shadow-gray-200/60 dark:shadow-gray-900/40 border border-gray-300 dark:border-gray-700/50 hover:shadow-xl hover:shadow-gray-300/70 dark:hover:shadow-gray-900/60 transition-all duration-300 flex items-start gap-4`}
              >
                <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${item.accentGradient} opacity-15 group-hover:opacity-25 blur-2xl transition-opacity`}></div>

                <div className="relative z-10">
                  <div className={`p-3 rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-300 dark:border-gray-700/60 w-fit mb-3 text-lg ${item.iconText} group-hover:scale-110 transition-transform`}>
                    {(() => {
                      const Icon = item.icon;
                      return <Icon size={28} />;
                    })()}
                  </div>

                  <h3 className="font-semibold text-lg md:text-xl tracking-tight text-gray-900 dark:text-gray-100">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
                </div>

                {/* Arrow Icon */}
                <div className="relative z-10 text-gray-300 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ml-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </Link>
            ))}

            {/* Headline before gated features (hide when logged in) */}
            {!user && (
              <div className="col-span-full -mb-1 mt-2">
                <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">Login to use features</h4>
              </div>
            )}

            {/* Gated features grid: 2x2 on mobile */}
            <div className="col-span-full grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {gatedModules.map((item) => (
                <Link
                  key={item.title}
                  to={item.path}
                  className={`group relative overflow-hidden ${item.bgLight} p-6 rounded-2xl shadow-lg shadow-gray-200/60 dark:shadow-gray-900/40 border border-gray-300 dark:border-gray-700/50 hover:shadow-xl hover:shadow-gray-300/70 dark:hover:shadow-gray-900/60 transition-all duration-300 flex items-start gap-4`}
                >
                  <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${item.accentGradient} opacity-15 group-hover:opacity-25 blur-2xl transition-opacity`}></div>

                  <div className="relative z-10">
                    <div className={`p-3 rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-300 dark:border-gray-700/60 w-fit mb-3 text-lg ${item.iconText} group-hover:scale-110 transition-transform`}>
                      {(() => {
                        const Icon = item.icon;
                        return <Icon size={28} />;
                      })()}
                    </div>

                    <h3 className="font-semibold text-lg md:text-xl tracking-tight text-gray-900 dark:text-gray-100">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
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
        </>
      )}
    </div>
  );
};

export default UserDashboard;