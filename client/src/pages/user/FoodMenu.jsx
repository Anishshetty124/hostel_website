import React, { useEffect, useMemo, useState } from 'react';

const FoodMenu = () => {
    const weeklyMenu = {
        Monday: {
            breakfast: { items: ["Shavige / Puliogare", "Veg Kurma", "Raitha", "Chutney", "Tea/Coffee/Milk"], time: "7:30 - 8:30 AM", color: "from-amber-50 to-orange-100" },
            lunch: { items: ["Chapathi", "Beetroot Sukka", "Saothekai Sambar", "Dal", "Rasam", "White/Boiled Rice", "Buttermilk", "Papad", "Pickle"], time: "12:30 - 1:40 PM", color: "from-emerald-50 to-teal-100" },
            snacks: { items: ["Samosa", "Tea/Coffee/Milk"], time: "4:30 - 5:30 PM", color: "from-blue-50 to-indigo-100" },
            nightmeal: { items: ["Chapathi", "Omlet", "Southe Nugge Gassi"], time: "7:30 - 8:40 PM", color: "from-purple-50 to-fuchsia-100" }
        },
        Tuesday: {
                breakfast: { items: ["Puri", "Sagu/Kurma", "Tea/Coffee/Milk"], time: "7:30 - 8:30 AM", color: "from-amber-50 to-orange-100" },
                lunch: { items: ["Chapathi", "Alu Mutter Gassi", "Soppu Sambar", "Beans Pallya", "Rasam", "White/Boiled Rice", "Buttermilk", "Papad", "Pickle"], time: "12:30 - 1:40 PM", color: "from-emerald-50 to-teal-100" },
                snacks: { items: ["Burger", "Tea/Coffee/Milk"], time: "4:30 - 5:30 PM", color: "from-blue-50 to-indigo-100" },
                nightmeal: { items: ["Chapathi", "Chicken Kabab / Chicken Chilly"], time: "7:30 - 8:40 PM", color: "from-purple-50 to-fuchsia-100" }
        },
        Wednesday: {
                breakfast: { items: ["Set Dosa", "Sambar", "Chutney", "Tomato Rice", "Tea/Coffee/Milk"], time: "7:30 - 8:30 AM", color: "from-amber-50 to-orange-100" },
                lunch: { items: ["Chapathi", "Bende Gassi", "Mix Veg Sambar", "Thonde Kai Pallya", "Tomato Rasam", "White/Boiled Rice", "Buttermilk", "Papad", "Pickle"], time: "12:30 - 1:40 PM", color: "from-emerald-50 to-teal-100" },
                snacks: { items: ["Veg Cutlet", "Tea/Coffee/Milk"], time: "4:30 - 5:30 PM", color: "from-blue-50 to-indigo-100" },
                nightmeal: { items: ["Chapathi", "Egg Masala", "Bendi Masala", "Heerekai"], time: "7:30 - 8:40 PM", color: "from-purple-50 to-fuchsia-100" }
        },
        Thursday: {
                breakfast: { items: ["Goli Vada", "Sambar", "Chutney", "Tea/Coffee/Milk"], time: "7:30 - 8:30 AM", color: "from-amber-50 to-orange-100" },
                lunch: { items: ["Chapathi", "Kai Kudu Gassi", "Kumbla Kadi Sambar", "Bende Sukka Pallya", "Lemon Rasam", "White/Boiled Rice", "Buttermilk", "Papad", "Pickle"], time: "12:30 - 1:40 PM", color: "from-emerald-50 to-teal-100" },
                snacks: { items: ["Ambade Vada", "Tea/Coffee/Milk"], time: "4:30 - 5:30 PM", color: "from-blue-50 to-indigo-100" },
                nightmeal: { items: ["Chapathi", "Chicken Sukka / Chicken Munchi"], time: "7:30 - 8:40 PM", color: "from-purple-50 to-fuchsia-100" }
        },
        Friday: {
                breakfast: { items: ["Neer Dosa", "Veg Pulav", "Raitha", "Chutney", "Tea/Coffee/Milk"], time: "7:30 - 8:30 AM", color: "from-amber-50 to-orange-100" },
                lunch: { items: ["Chapathi", "Chana Masala", "Bende Nugge Sambar", "Suran Pallya", "Payasam", "White/Boiled Rice", "Buttermilk", "Papad", "Pickle"], time: "12:30 - 1:40 PM", color: "from-emerald-50 to-teal-100" },
                snacks: { items: ["Upma (Small Rava)", "Tea/Coffee/Milk"], time: "4:30 - 5:30 PM", color: "from-blue-50 to-indigo-100" },
                nightmeal: { items: ["Chapathi", "Kurma or Mix Sambar"], time: "7:30 - 8:40 PM", color: "from-purple-50 to-fuchsia-100" }
        },
        Saturday: {
                breakfast: { items: ["Parotha", "Bisi Bele Bath", "Chutney", "Tea/Coffee/Milk"], time: "7:30 - 8:30 AM", color: "from-amber-50 to-orange-100" },
                lunch: { items: ["Chapathi", "Bende Sambar", "Cabbage Pallya", "Chana Dal", "White/Boiled Rice", "Buttermilk", "Papad", "Pickle"], time: "12:30 - 1:40 PM", color: "from-emerald-50 to-teal-100" },
                snacks: { items: ["Alu Bonda", "Tea/Coffee/Milk"], time: "4:30 - 5:30 PM", color: "from-blue-50 to-indigo-100" },
                nightmeal: { items: ["Chapathi", "Omlet", "Alu Mutter", "Tomato Rasam/Dal"], time: "7:30 - 8:40 PM", color: "from-purple-50 to-fuchsia-100" }
        },
        Sunday: {
                breakfast: { items: ["Masala Dosa", "Tea/Coffee/Milk"], time: "7:30 - 8:30 AM", color: "from-amber-50 to-orange-100" },
                lunch: { items: ["White Rice", "Sambar", "Rasam", "Curd Rice", "Banana"], time: "12:30 - 1:40 PM", color: "from-emerald-50 to-teal-100" },
                snacks: { items: ["Samosa", "Tea/Coffee/Milk"], time: "4:30 - 5:30 PM", color: "from-blue-50 to-indigo-100" },
                nightmeal: { items: ["Biryani and Pulav", "Chicken Gravy", "Paneer Gravy"], time: "7:30 - 8:40 PM", color: "from-purple-50 to-fuchsia-100" }
        }
    };

    const currentDayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
    const [activeDay, setActiveDay] = useState(weeklyMenu[currentDayName] ? currentDayName : "Monday");

    // Order days so that today's day appears first
    const days = useMemo(() => {
        const allDays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        const todayIndex = new Date().getDay();
        return [...allDays.slice(todayIndex), ...allDays.slice(0, todayIndex)];
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 font-sans text-slate-900 dark:text-gray-100 pb-10">
            {/* 1. RESPONSIVE HEADER */}
            <header className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 pt-8 pb-16 md:pt-12 md:pb-20 px-4 md:px-6">
                <div className="max-w-7xl mx-auto flex flex-col xl:flex-row justify-between items-center gap-8">
                    <div className="relative text-center xl:text-left">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-900 dark:text-gray-100 uppercase leading-none">
                            Mess <span className="text-indigo-600">Timetable</span>
                        </h1>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 xl:left-0 xl:translate-x-0 h-1.5 w-24 md:w-32 bg-indigo-600 rounded-full"></div>
                    </div>
          
                    {/* Day Scroller - Hidden scrollbar but allows swiping on mobile */}
                    <div className="w-full xl:w-auto flex gap-2 md:gap-3 overflow-x-auto pb-4 px-2 no-scrollbar snap-x touch-pan-x">
                        {days.map((day) => (
                            <button
                                key={day}
                                onClick={() => setActiveDay(day)}
                                className={`group relative px-5 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl transition-all duration-300 flex-shrink-0 snap-start ${
                                    activeDay === day 
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-300/50 dark:shadow-indigo-900/30 -translate-y-1" 
                                    : "bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-600 hover:shadow-md shadow-sm shadow-slate-200/60 dark:shadow-black/20"
                                }`}
                            >
                                <span className="block text-[8px] md:text-[10px] uppercase font-black opacity-60 tracking-widest text-center">Day</span>
                                <span className="text-base md:text-lg font-bold">{day.substring(0, 3)}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 -mt-8 md:-mt-10">
                {/* 2. DYNAMIC GRID FOR MEAL CARDS */}
                {/* 1 col on mobile, 2 on tablet, 4 on desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                    {Object.entries(weeklyMenu[activeDay]).map(([meal, data]) => (
                        <div key={meal} className="group relative bg-white dark:bg-gray-800 rounded-[2rem] md:rounded-[2.5rem] p-1 shadow-xl shadow-slate-200/50 dark:shadow-black/10 transition-all duration-500">
                            <div className={`h-full rounded-[1.8rem] md:rounded-[2.3rem] p-6 md:p-8 bg-gradient-to-br ${data.color} dark:from-gray-800 dark:to-gray-700 border border-white/60 dark:border-gray-700`}>
                
                                <div className="flex justify-between items-center mb-6 md:mb-8">
                                    <div className="p-2 md:p-3 bg-white dark:bg-gray-900 rounded-xl md:rounded-2xl shadow-sm border border-white/60 dark:border-gray-700/60">
                                        <svg className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-xs md:text-sm font-bold uppercase text-indigo-700 dark:text-indigo-300 tracking-wide bg-white/60 dark:bg-gray-900/50 px-3 py-1.5 rounded-full border border-white dark:border-gray-700 backdrop-blur-sm font-mono">
                                        {data.time}
                                    </span>
                                </div>

                                <h3 className="text-2xl md:text-3xl font-black capitalize text-slate-800 dark:text-gray-100 mb-4 md:mb-6 tracking-tight">{meal}</h3>
                
                                <div className="space-y-3 md:space-y-4">
                                    {data.items.map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/80 dark:bg-gray-900/70 flex items-center justify-center shadow-sm text-xs md:text-sm font-bold text-slate-500 dark:text-gray-300 flex-shrink-0">
                                                0{i + 1}
                                            </div>
                                            <span className="font-bold text-base md:text-lg text-slate-700 dark:text-gray-200 leading-tight">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 3. FULL WEEKLY VIEW SECTION */}
                <section className="mt-16 md:mt-24">
                    <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12">
                        <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-gray-100 tracking-tight whitespace-nowrap">
                            Weekly <span className="text-slate-400 dark:text-gray-400">Roadmap</span>
                        </h2>
                        <div className="h-px w-full bg-slate-200 dark:bg-gray-700"></div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {days.map((day) => (
                            <div 
                                key={day} 
                                className={`relative overflow-hidden bg-white dark:bg-gray-800 p-5 md:p-6 rounded-2xl md:rounded-[2rem] border transition-all duration-300 flex flex-col xl:flex-row xl:items-center gap-4 md:gap-8 ${
                                    activeDay === day ? "border-indigo-600 ring-2 md:ring-4 ring-indigo-50 dark:ring-indigo-900/20" : "border-slate-100 dark:border-gray-700 hover:border-slate-200 dark:hover:border-gray-600"
                                }`}
                            >
                                <div className="min-w-[120px] flex justify-between items-center xl:block">
                                    <div>
                                        <span className="block text-[8px] md:text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-0.5">Weekday</span>
                                        <h4 className="text-xl md:text-2xl font-black text-slate-900 dark:text-gray-100 uppercase">{day}</h4>
                                    </div>
                                    {/* Show mobile-only indicator for active day */}
                                    {activeDay === day && <span className="xl:hidden bg-indigo-600 w-2 h-2 rounded-full animate-ping"></span>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 flex-grow">
                                    {Object.entries(weeklyMenu[day]).map(([meal, data]) => (
                                        <div key={meal} className="border-l-2 border-slate-100 dark:border-gray-700 pl-4 py-1">
                                            <span className="text-[10px] md:text-xs font-black text-slate-400 dark:text-gray-400 uppercase tracking-widest">{meal}</span>
                                            <p className="font-bold text-slate-700 dark:text-gray-300 text-sm md:text-base mt-1 line-clamp-1">{data.items.join(" • ")}</p>
                                        </div>
                                    ))}
                                </div>

                                <button 
                                    onClick={() => {
                                        setActiveDay(day);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="w-full xl:w-auto bg-slate-900 dark:bg-indigo-600 text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all active:scale-95"
                                >
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default FoodMenu;