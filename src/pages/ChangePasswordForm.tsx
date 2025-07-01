import type React from "react";
import type { ChangePasswordFormProps } from "../common/types";
import { useState } from "react";
import { Lock } from "lucide-react";

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ handleChangePassword, setError, currentLanguage, setCurrentPage }) => {
    const [oldPassword, setOldPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            setError(currentLanguage === 'en' ? "All fields are required." : "تمام فیلڈز ضروری ہیں۔");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setError(currentLanguage === 'en' ? "New password and confirmation do not match." : "نیا پاس ورڈ اور تصدیقی پاس ورڈ مماثل نہیں ہیں۔");
            return;
        }
        if (oldPassword === newPassword) {
            setError(currentLanguage === 'en' ? "New password cannot be the same as the old password." : "نیا پاس ورڈ پرانے پاس ورڈ جیسا نہیں ہو سکتا۔");
            return;
        }

        try {
            await handleChangePassword({ old_password: oldPassword, new_password: newPassword });
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setCurrentPage('settings');
        } catch (error) {
            // Error handled by handleChangePassword, which sets global error state
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 mx-auto w-full border border-blue-50">
            <h2 className="text-2xl font-bold mb-5 text-gray-800 text-center">
                {currentLanguage === 'en' ? 'Change Admin Password' : 'ایڈمن پاس ورڈ تبدیل کریں'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">
                        {currentLanguage === 'en' ? 'Old Password' : 'پرانا پاس ورڈ'}
                    </label>
                    <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="password"
                            id="oldPassword"
                            className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            placeholder={currentLanguage === 'en' ? 'Enter old password' : 'پرانا پاس ورڈ درج کریں'}
                            required
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        {currentLanguage === 'en' ? 'New Password' : 'نیا پاس ورڈ'}
                    </label>
                    <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="password"
                            id="newPassword"
                            className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder={currentLanguage === 'en' ? 'Enter new password' : 'نیا پاس ورڈ درج کریں'}
                            required
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
                        {currentLanguage === 'en' ? 'Confirm New Password' : 'نیا پاس ورڈ دوبارہ درج کریں'}
                    </label>
                    <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="password"
                            id="confirmNewPassword"
                            className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder={currentLanguage === 'en' ? 'Confirm new password' : 'نیا پاس ورڈ دوبارہ درج کریں'}
                            required
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold py-3 px-4 rounded-xl shadow-md transition duration-300 ease-in-out text-lg tracking-wide transform hover:scale-105 active:scale-95"
                >
                    {currentLanguage === 'en' ? 'Change Password' : 'پاس ورڈ تبدیل کریں'}
                </button>
            </form>
            <button
                onClick={() => setCurrentPage('settings')}
                className="mt-6 w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition duration-300 ease-in-out text-lg tracking-wide transform hover:scale-105 active:scale-95"
            >
                {currentLanguage === 'en' ? 'Back to Settings' : 'ترتیبات پر واپس جائیں'}
            </button>
        </div>
    );
};