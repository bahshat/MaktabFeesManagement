import React, { useState, useEffect, useCallback } from 'react';
import { Clock } from 'lucide-react';

import type { Student, StudentPaymentDetailsResponse, ErrorResponse, MessageDisplayProps } from './common/types';
import { StudentDetail } from './pages/StudentDetail';
import { Dashboard } from './pages/Dashboard';
import { PendingStudentList } from './pages/PendingStudentList';
import { SettingsPage } from './pages/SettingsPage';
import { ChangePasswordForm } from './pages/ChangePasswordForm';
import { ReminderList } from './pages/ReminderList';
import { AuthForm } from './pages/AuthForm';
import { Navigation } from './common/Navigation';
import { Header } from './common/Header';
import { LoadingOverlay } from './common/LoadingOverlay';


const App = () => {
    const [currentPage, setCurrentPage] = useState('login');
    const [students, setStudents] = useState<Student[] | null>(null);
    const [pendingStudents, setPendingStudents] = useState<Student[] | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [studentPayments, setStudentPayments] = useState<StudentPaymentDetailsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ur'>('en');
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [dashboardSummary, setDashboardSummary] = useState<{
        total_students: number | null;
        total_pending_amount: number | null;
        pending_students_count: number | null;
        cleared_students_count: number | null;
    } | null>(null);

    const API_BASE_URL = 'http://192.168.1.9:5000' //import.meta.env.VITE_API_BASE_URL

    const toggleLanguage = () => {
        setCurrentLanguage(prevLang => prevLang === 'en' ? 'ur' : 'en');
    };

    const MessageDisplay: React.FC<MessageDisplayProps> = ({ message, type }) => {
        if (!message) return null;

        const bgColor = type === 'error' ? 'bg-red-100' : 'bg-green-100';
        const textColor = type === 'error' ? 'text-red-700' : 'text-green-700';
        const borderColor = type === 'error' ? 'border-red-400' : 'border-green-400';

        useEffect(() => {
            const timer = setTimeout(() => {
                setError(null);
                setSuccessMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }, [message]);

        return (
            <div className={`${bgColor} ${textColor} border ${borderColor} rounded-xl p-4 mb-4 text-center mx-auto max-w-xl font-medium text-sm shadow-md`}>
                {message}
            </div>
        );
    };

    const fetchData = useCallback(async <T,>(
        url: string,
        errorMessage: string
    ): Promise<T | null> => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorText = await response.text();
                let parsedError: ErrorResponse | null = null;
                try {
                    parsedError = JSON.parse(errorText);
                } catch (e) {
                }
                throw new Error(parsedError?.error || `HTTP error! Status: ${response.status}. Response: ${errorText || 'No response body.'}`);
            }
            const data: T = await response.json();
            return data;
        } catch (e: any) {
            console.error(errorMessage, e);
            setError(`${errorMessage} Error: ${e.message}. Please check if the backend is running and accessible from ${url}.`);
            return null;
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    const fetchPendingStudents = useCallback(async () => {
        if (!isLoggedIn) return;
        const data = await fetchData<Student[]>(`${API_BASE_URL}/students/pending`, "Failed to load pending students.");
        setPendingStudents(data);
    }, [fetchData, API_BASE_URL, isLoggedIn]);

    const fetchStudentPayments = useCallback(async (studentId: number) => {
        if (!isLoggedIn) return;
        const fetchedData = await fetchData<StudentPaymentDetailsResponse>(`${API_BASE_URL}/students/${studentId}/payments`, "Failed to load payment details.");
        if (fetchedData) {
            setSelectedStudent(fetchedData.student);
            setStudentPayments(fetchedData);
        } else {
            setSelectedStudent(null);
            setStudentPayments(null);
        }
    }, [fetchData, API_BASE_URL, isLoggedIn]);


    const fetchDashboardSummary = useCallback(async () => {
        if (!isLoggedIn) return;
        const data = await fetchData<{
            total_students: number;
            total_pending_amount: number;
            pending_students_count: number;
            cleared_students_count: number;
        }>(`${API_BASE_URL}/dashboard_summary`, "Failed to load dashboard summary.");
        setDashboardSummary(data);
    }, [fetchData, API_BASE_URL, isLoggedIn]);

    const handleMutation = useCallback(async (url: string, method: string, body: any, successMsg: string, errorMsg: string) => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: body ? JSON.stringify(body) : null,
            });

            if (!response.ok) {
                const errorText = await response.text();
                let parsedError: ErrorResponse | null = null;
                try {
                    parsedError = JSON.parse(errorText);
                } catch (e) {
                }
                throw new Error(parsedError?.error || `HTTP error! Status: ${response.status}. Response: ${errorText || 'No response body.'}`);
            }
            const data = await response.json();
            setSuccessMessage(successMsg);
            return data;
        } catch (e: any) {
            console.error(errorMsg, e);
            setError(`${errorMsg} Error: ${e.message}.`);
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const handleLogin = async (credentials: { username: string; password: string; }) => {
        try {
            await handleMutation(
                `${API_BASE_URL}/login`,
                'POST',
                credentials,
                currentLanguage === 'en' ? "Login successful!" : "لاگ ان کامیاب!",
                currentLanguage === 'en' ? "Login failed. Invalid credentials." : "لاگ ان ناکام. غلط معلومات."
            );
            setIsLoggedIn(true);
            setCurrentPage('pendingStudents');
            fetchPendingStudents();
        } catch (e) { /* Error handled by handleMutation */ }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setCurrentPage('login');
        setStudents(null);
        setPendingStudents(null);
        setSelectedStudent(null);
        setStudentPayments(null);
        setSuccessMessage(currentLanguage === 'en' ? "Logged out successfully." : "کامیابی سے لاگ آوٹ ہو گیا۔");
    };

    const handleChangePassword = async (passwords: { old_password: string; new_password: string; }) => {
        try {
            await handleMutation(
                `${API_BASE_URL}/change_password`,
                'PUT',
                passwords,
                currentLanguage === 'en' ? "Password changed successfully!" : "پاس ورڈ کامیابی سے تبدیل ہو گیا ہے۔",
                currentLanguage === 'en' ? "Failed to change password. Please check old password." : "پاس ورڈ تبدیل کرنے میں ناکام۔ براہ کرم پرانا پاس ورڈ چیک کریں۔"
            );
            setCurrentPage('settings');
        } catch (e) { /* Error handled by handleMutation */ }
    };

    const handleUpdatePayment = async (studentId: number, paidTillDate: string) => {
        try {
            await handleMutation(
                `${API_BASE_URL}/students/${studentId}/payments`,
                'PUT',
                { paid_till: paidTillDate },
                currentLanguage === 'en' ? "Payment updated successfully!" : "ادائیگی کامیابی سے اپ ڈیٹ ہو گئی۔",
                currentLanguage === 'en' ? "Failed to update payment." : "ادائیگی اپ ڈیٹ کرنے میں ناکام۔"
            );
            fetchStudentPayments(studentId);
            fetchPendingStudents();
        } catch (e) { /* Error handled by handleMutation */ }
    };

    const handleDeleteStudent = async (studentId: number, studentName: string, passwordConfirmation: string) => {
        try {
            await handleMutation(
                `${API_BASE_URL}/students/${studentId}`,
                'DELETE',
                { password: passwordConfirmation },
                currentLanguage === 'en' ? `Student '${studentName}' deleted successfully!` : `طالب علم '${studentName}' کامیابی سے حذف کر دیا گیا!`,
                currentLanguage === 'en' ? `Failed to delete student '${studentName}'. Invalid password or other error.` : `طالب علم '${studentName}' حذف کرنے میں ناکام۔ غلط پاس ورڈ یا کوئی اور خرابی۔`
            );
            setCurrentPage('allStudents');
            fetchPendingStudents();
            setSelectedStudent(null);
            setStudentPayments(null);
        } catch (e) { /* Error handled by handleMutation */ }
    };

    useEffect(() => {
        if (isLoggedIn) {
            fetchDashboardSummary();
            fetchPendingStudents();
        }
    }, [isLoggedIn, fetchPendingStudents]);

    const renderPage = () => {
        if (!isLoggedIn) {
            return <AuthForm handleLogin={handleLogin} setError={setError} currentLanguage={currentLanguage} />;
        }

        if (loading) return null;

        const studentDetailViewMode: 'full' | 'pending-summary' =
            (currentPage === 'allStudents' || currentPage === 'addStudent') ? 'full' : 'pending-summary';


        switch (currentPage) {
            case 'pendingStudents':
                return (
                    <PendingStudentList
                        students={pendingStudents}
                        title={currentLanguage === 'en' ? "Pending Fees" : "زیر التواء فیس والے طلباء"}
                        onSelectStudent={(s) => {
                            setSelectedStudent(s);
                            setCurrentPage('studentDetail');
                            fetchStudentPayments(s.id);
                        }}
                        currentLanguage={currentLanguage}
                    />
                );
            case 'studentDetail':
                if (!selectedStudent || studentPayments === null) {
                    return (
                        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 mx-auto w-full border border-blue-50 text-center text-gray-600">
                            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-lg font-medium">
                                {currentLanguage === 'en' ? 'Loading student details or an error occurred.' : 'طالب علم کی تفصیلات لوڈ ہو رہی ہیں یا کوئی خرابی پیش آئی ہے۔'}
                            </p>
                        </div>
                    );
                }

                return (
                    <StudentDetail
                        student={selectedStudent}
                        payments={studentPayments.payments}
                        onUpdatePayment={handleUpdatePayment}
                        handleDeleteStudent={handleDeleteStudent}
                        setError={setError}
                        setSuccessMessage={setSuccessMessage}
                        pendingDataForStudent={{
                            pending_months: studentPayments.pending_months,
                            pending_amount: studentPayments.pending_amount,
                            paid_till: studentPayments.payments.length > 0 ? studentPayments.payments[0].paid_till : null
                        }}
                        viewMode={studentDetailViewMode}
                        currentLanguage={currentLanguage}
                    />
                );
            case 'dashboard':
                 return <Dashboard dashboardSummary={dashboardSummary} currentLanguage={currentLanguage} />;;
            case 'reminders':
                return <ReminderList allStudents={students} setError={setError} setSuccessMessage={setSuccessMessage} currentLanguage={currentLanguage} />;
            case 'settings':
                return <SettingsPage
                    setCurrentPage={setCurrentPage}
                    currentLanguage={currentLanguage}
                    toggleLanguage={toggleLanguage}
                    handleChangePassword={handleChangePassword}
                    setError={setError}
                    setSuccessMessage={setSuccessMessage}
                    handleLogout={handleLogout}
                />;
            case 'changePassword':
                return <ChangePasswordForm
                    handleChangePassword={handleChangePassword}
                    setError={setError}
                    setSuccessMessage={setSuccessMessage}
                    currentLanguage={currentLanguage}
                    setCurrentPage={setCurrentPage}
                />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-sans pb-24 sm:pb-4 relative">
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400..700&display=swap');
                body {
                    font-family: 'Inter', sans-serif;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    color: #333;
                    padding-top: 80px;
                }
                .lang-ur {
                    font-family: 'Noto Nastaliq Urdu', serif;
                    direction: rtl;
                    text-align: right;
                }
                input[type="date"]::-webkit-calendar-picker-indicator {
                    filter: invert(0.5);
                    cursor: pointer;
                    margin-left: 0.5rem;
                }
                input[type="date"] {
                    appearance: none;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                }
                .shadow-top-lg {
                    box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05), 0 -2px 4px -1px rgba(0, 0, 0, 0.03);
                }
                .rounded-lg { border-radius: 1rem; }
                .rounded-xl { border-radius: 1.25rem; }
                .rounded-2xl { border-radius: 1.5rem; }
                .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
                .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
                `}
            </style>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />

            <LoadingOverlay isLoading={loading} />

            <Header setCurrentPage={setCurrentPage} currentLanguage={currentLanguage} isLoggedIn={isLoggedIn} currentPage={currentPage} />

            <main className={`max-w-4xl mx-auto px-4 pt-4 ${currentLanguage === 'ur' ? 'lang-ur' : ''}`}>
                <MessageDisplay message={error} type="error" />
                <MessageDisplay message={successMessage} type="success" />
                {renderPage()}
            </main>

            {isLoggedIn && <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} currentLanguage={currentLanguage} />}
        </div>
    );
};

export default App;