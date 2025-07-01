import { User, Lock } from "lucide-react";
import type { AuthFormProps } from "../common/types";
import { useState } from "react";

export const AuthForm: React.FC<AuthFormProps> = ({ handleLogin, setError, currentLanguage }) => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            setError(currentLanguage === 'en' ? "Please enter both username and password." : "براہ کرم صارف کا نام اور پاس ورڈ دونوں درج کریں۔");
            return;
        }
        try {
            await handleLogin({ username, password });
            setUsername('');
            setPassword('');
        } catch (error) {
            // Error handled by handleLogin, which sets the global error state
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 mx-auto w-full border border-blue-50">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
                {currentLanguage === 'en' ? 'Admin Login' : 'ایڈمن لاگ ان'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        {currentLanguage === 'en' ? 'Username' : 'صارف کا نام'}
                    </label>
                    <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            id="username"
                            className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={currentLanguage === 'en' ? 'Enter your username' : 'اپنا صارف کا نام درج کریں'}
                            required
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        {currentLanguage === 'en' ? 'Password' : 'پاس ورڈ'}
                    </label>
                    <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="password"
                            id="password"
                            className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={currentLanguage === 'en' ? 'Enter your password' : 'اپنا پاس ورڈ درج کریں'}
                            required
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-3 px-4 rounded-xl shadow-md transition duration-300 ease-in-out text-lg tracking-wide transform hover:scale-105 active:scale-95"
                >
                    {currentLanguage === 'en' ? 'Login' : 'لاگ ان'}
                </button>
            </form>
        </div>
    );
};
