import { ArrowLeftCircle, Settings } from "lucide-react";
import type { HeaderProps } from "./types";

export const Header: React.FC<HeaderProps> = ({ setCurrentPage, currentLanguage, isLoggedIn, currentPage }) => {
    const title = currentLanguage === 'en' ? 'Maktab Fees Portal' : 'مکتب فیس پورٹل';
    const organizationName = currentLanguage === 'en' ? 'Anjuman Abu Hurairah' : 'انجمن ابو ہریرہ';

    const showBackButton = isLoggedIn && (
        currentPage === 'studentDetail' ||
        currentPage === 'addStudent' ||
        currentPage === 'settings' ||
        currentPage === 'changePassword'
    );

    const getBackPage = () => {
        switch (currentPage) {
            case 'studentDetail':
                return 'allStudents';
            case 'addStudent':
                return 'allStudents';
            case 'changePassword':
                return 'settings';
            case 'settings':
                return 'allStudents';
            default:
                return 'allStudents';
        }
    };


    return (
        <header className="fixed top-0 left-0 right-0 bg-gradient-to-br from-blue-700 to-purple-800 text-white p-4 pb-6 rounded-b-3xl shadow-xl z-20 font-bold">
            <div className="flex justify-between items-center relative w-full px-2 sm:px-4">
                {showBackButton ? (
                    <button
                        onClick={() => setCurrentPage(getBackPage())}
                        className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition duration-200 shadow-md flex-shrink-0"
                        title={currentLanguage === 'en' ? 'Back' : 'پیچھے جائیں'}
                    >
                        <ArrowLeftCircle className="w-5 h-5 text-white" />
                    </button>
                ) : (
                    <div className="w-8"></div>
                )}
                <h1 className="text-xl font-extrabold text-center tracking-wide leading-tight flex-grow drop-shadow-lg mx-2">
                    {title}
                </h1>
                <div className="flex space-x-2 flex-shrink-0">
                    {isLoggedIn && (
                        <button
                            onClick={() => setCurrentPage('settings')}
                            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition duration-200 shadow-md"
                            title={currentLanguage === 'en' ? 'Settings' : 'ترتیبات'}
                        >
                            <Settings className="w-5 h-5 text-white" />
                        </button>
                    )}
                </div>
            </div>
            <p className="text-center text-sm text-blue-200 mt-1 font-medium">{organizationName}</p>
        </header>
    );
};
