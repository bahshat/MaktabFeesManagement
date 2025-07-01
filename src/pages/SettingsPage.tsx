import { Globe, Lock } from "lucide-react";
import type { SettingsPageProps } from "../common/types";

export const SettingsPage: React.FC<SettingsPageProps> = ({ setCurrentPage, currentLanguage, toggleLanguage, handleLogout }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 mx-auto w-full border border-blue-50">
            <h2 className="text-2xl font-bold mb-5 text-gray-800 text-center">
                {currentLanguage === 'en' ? 'Settings' : 'ترتیبات'}
            </h2>
            <div className="space-y-4">
                <button
                    onClick={toggleLanguage}
                    className="w-full flex items-center justify-center p-4 bg-blue-100 text-blue-800 rounded-xl shadow-sm hover:bg-blue-200 transition duration-150 font-semibold"
                >
                    <Globe className="w-5 h-5 mr-2" />
                    {currentLanguage === 'en' ? 'Toggle Language (English / اردو)' : 'زبان تبدیل کریں (اردو / انگریزی)'}
                </button>

                <button
                    onClick={() => setCurrentPage('changePassword')}
                    className="w-full flex items-center justify-center p-4 bg-purple-100 text-purple-800 rounded-xl shadow-sm hover:bg-purple-200 transition duration-150 font-semibold"
                >
                    <Lock className="w-5 h-5 mr-2" />
                    {currentLanguage === 'en' ? 'Change Admin Password' : 'ایڈمن پاس ورڈ تبدیل کریں'}
                </button>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-700">
                    <p className="font-semibold mb-2">
                        {currentLanguage === 'en' ? 'Other Settings (Future Feature)' : 'دیگر ترتیبات (مستقبل کی خصوصیت)'}
                    </p>
                    <p className="text-sm">
                        {currentLanguage === 'en' ? 'This section will include more configurations like user management or data export.' : 'اس حصے میں مزید ترتیبات شامل ہوں گی جیسے صارف کا انتظام یا ڈیٹا ایکسپورٹ۔'}
                    </p>
                </div>
            </div>
            <button
                onClick={handleLogout}
                className="mt-6 w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition duration-300 ease-in-out text-lg tracking-wide transform hover:scale-105 active:scale-95"
            >
                {currentLanguage === 'en' ? 'Logout' : 'لاگ آوٹ'}
            </button>
            <button
                onClick={() => setCurrentPage('allStudents')}
                className="mt-4 w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition duration-300 ease-in-out text-lg tracking-wide transform hover:scale-105 active:scale-95"
            >
                {currentLanguage === 'en' ? 'Back to Main' : 'واپس مین پر جائیں'}
            </button>
        </div>
    );
};
