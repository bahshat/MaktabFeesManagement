import type { NavigationProps } from "./types";
import { Home, Clock, UserPlus, BarChart2, BellRing} from 'lucide-react';

export const Navigation: React.FC<NavigationProps> = ({ currentPage, setCurrentPage, fetchPendingStudents, fetchAllStudents, currentLanguage, isLoggedIn }) => {
    if (!isLoggedIn) return null;

    const navItems = [
        { name: currentLanguage === 'en' ? 'All Students' : 'تمام طلباء', icon: Home, page: 'allStudents', action: fetchAllStudents },
        { name: currentLanguage === 'en' ? 'Pending' : 'زیر التواء', icon: Clock, page: 'pendingStudents', action: fetchPendingStudents },
        { name: currentLanguage === 'en' ? 'Add' : 'شامل کریں', icon: UserPlus, page: 'addStudent' },
        { name: currentLanguage === 'en' ? 'Dashboard' : 'ڈیش بورڈ', icon: BarChart2, page: 'dashboard', action: fetchAllStudents },
        { name: currentLanguage === 'en' ? 'Reminders' : 'یاد دہانیاں', icon: BellRing, page: 'reminders', action: fetchAllStudents }
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm shadow-top-lg border-t border-gray-100 z-50 p-2 sm:relative sm:bg-transparent sm:shadow-none sm:border-none sm:mb-8 flex justify-around sm:justify-center gap-2 sm:gap-4 sm:p-0">
            {navItems.map((item) => (
                <button
                    key={item.page}
                    onClick={() => {
                        setCurrentPage(item.page);
                        if (item.action) item.action();
                    }}
                    className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-xl transition-all duration-200 ease-in-out
                        ${currentPage === item.page ? 'text-blue-700 font-semibold bg-blue-100 shadow-md' : 'text-gray-600 hover:text-blue-700 hover:bg-gray-50'}`}
                >
                    <item.icon className="w-6 h-6 mb-1 drop-shadow-sm" />
                    <span className="text-xs sm:text-sm font-medium">{item.name}</span>
                </button>
            ))}
        </nav>
    );
};