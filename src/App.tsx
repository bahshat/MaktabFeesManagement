import React, { useState, useEffect, useCallback } from 'react';
import {
    Home, Clock, UserPlus, BookOpen, GraduationCap, Search,
    DollarSign, MapPin, Phone, CalendarDays, CheckCircle, XCircle,
    BarChart2, PieChart, TrendingUp, Settings, ChevronDown, ChevronUp, Globe, LogOut, Lock, BellRing, User, MessageSquare, MessageSquareText // Icons for dashboard, settings, expand/collapse, reminders, user, WhatsApp, SMS
} from 'lucide-react'; // Ensure 'lucide-react' is installed via npm/yarn
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, XAxis, YAxis, Bar, LineChart, Line } from 'recharts';

// --- Type Definitions ---
interface Student {
    id: number;
    name: string;
    address: string | null;
    phone: string | null;
    admission_date: string; //YYYY-MM-DD
    admission_cancel_date: string | null; //YYYY-MM-DD
    monthly_fee: number;
    paid_till?: string; //YYYY-MM-DD - latest payment
    pending_months?: number;
    pending_amount?: number;
}

interface Payment {
    id: number;
    student_id: number;
    paid_till: string; //YYYY-MM-DD
}

interface StudentPaymentDetailsResponse {
    student: Student;
    payments: Payment[];
    pending_months: number;
    pending_amount: number;
}

interface ErrorResponse {
    error: string;
}

// --- Component Definitions ---

// LoadingOverlay.tsx
interface LoadingOverlayProps {
    isLoading: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 bg-blue-950 bg-opacity-70 flex items-center justify-center z-[9999] transition-opacity duration-300 backdrop-blur-sm">
            <div className="flex flex-col items-center text-white p-6 rounded-xl bg-blue-800/80 shadow-2xl">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-400"></div>
                <p className="mt-4 text-xl font-semibold">Loading data...</p>
            </div>
        </div>
    );
};

// Header.tsx
interface HeaderProps {
    setCurrentPage: (page: string) => void;
    currentLanguage: 'en' | 'ur';
    toggleLanguage: () => void;
    isLoggedIn: boolean; // Added isLoggedIn prop
    handleLogout: () => void; // Added handleLogout prop
}

const Header: React.FC<HeaderProps> = ({ setCurrentPage, currentLanguage, toggleLanguage, isLoggedIn, handleLogout }) => {
    const title = currentLanguage === 'en' ? 'Maktab Fees Portal' : 'مکتب فیس پورٹل';
    const subtitle = currentLanguage === 'en' ? 'Manage payments with ease' : 'آسانی سے ادائیگیوں کا انتظام کریں';
    const organizationName = currentLanguage === 'en' ? 'Anjuman Abu Hurairah' : 'انجمن ابو ہریرہ';

    return (
        <header className="bg-gradient-to-br from-blue-700 to-purple-800 text-white p-6 pb-8 rounded-b-3xl shadow-xl relative z-10 font-bold">
            <div className="flex justify-center items-center relative w-full">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-center tracking-wide leading-tight flex-grow drop-shadow-lg">
                    {title}
                </h1>
                <div className="absolute right-0 flex space-x-2 mr-2 z-20 top-4 sm:top-auto"> {/* Adjusted positioning and z-index */}
                    {isLoggedIn && ( // Only show logout if logged in
                        <button
                            onClick={handleLogout}
                            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition duration-200 shadow-md"
                            title={currentLanguage === 'en' ? 'Logout' : 'لاگ آوٹ'}
                        >
                            <LogOut className="w-5 h-5 text-white" />
                        </button>
                    )}
                    <button
                        onClick={toggleLanguage}
                        className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition duration-200 shadow-md"
                        title={currentLanguage === 'en' ? 'Change Language' : 'زبان تبدیل کریں'}
                    >
                        <Globe className="w-5 h-5 text-white" />
                    </button>
                    {isLoggedIn && ( // Only show settings if logged in
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
            <p className="text-center text-sm text-blue-200 mt-1 font-medium">{subtitle}</p>
        </header>
    );
};


// Navigation.tsx
interface NavigationProps {
    currentPage: string;
    setCurrentPage: (page: string) => void;
    fetchPendingStudents: () => void;
    fetchAllStudents: () => void;
    currentLanguage: 'en' | 'ur';
    isLoggedIn: boolean; // Added isLoggedIn prop
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, setCurrentPage, fetchPendingStudents, fetchAllStudents, currentLanguage, isLoggedIn }) => {
    if (!isLoggedIn) return null; // Hide navigation if not logged in

    const navItems = [
        { name: currentLanguage === 'en' ? 'All Students' : 'تمام طلباء', icon: Home, page: 'allStudents', action: fetchAllStudents },
        { name: currentLanguage === 'en' ? 'Pending' : 'زیر التواء', icon: Clock, page: 'pendingStudents', action: fetchPendingStudents },
        { name: currentLanguage === 'en' ? 'Add' : 'شامل کریں', icon: UserPlus, page: 'addStudent' },
        { name: currentLanguage === 'en' ? 'Dashboard' : 'ڈیش بورڈ', icon: BarChart2, page: 'dashboard', action: fetchAllStudents },
        { name: currentLanguage === 'en' ? 'Reminders' : 'یاد دہانیاں', icon: BellRing, page: 'reminders', action: fetchAllStudents } // Added Reminders button
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

// StudentList.tsx
interface StudentListProps {
    students: Student[] | null;
    title: string;
    onSelectStudent: (student: Student, viewMode: 'full' | 'pending-summary') => void; // Added viewMode
}

const StudentList: React.FC<StudentListProps> = ({ students, title, onSelectStudent }) => {
    const [searchTerm, setSearchTerm] = useState<string>('');

    const filteredStudents = students?.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 mx-auto w-full max-w-xl border border-blue-50">
            <h2 className="text-2xl font-bold mb-5 text-gray-800 text-center">{title}</h2>

            {/* Search Input */}
            <div className="relative mb-6">
                <input
                    type="text"
                    placeholder="Search students by name..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            {!students || students.length === 0 ? (
                <div className="bg-blue-50 p-6 rounded-xl shadow-inner text-center text-gray-600 mt-8">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-blue-300" />
                    <p className="text-lg font-medium">No student records found.</p>
                </div>
            ) : filteredStudents.length === 0 ? (
                <div className="bg-blue-50 p-6 rounded-xl shadow-inner text-center text-gray-600 mt-8">
                    <Search className="w-12 h-12 mx-auto mb-4 text-blue-300" />
                    <p className="text-lg font-medium">No students match your search criteria.</p>
                </div>
            ) : (
                <ul className="divide-y divide-blue-50">
                    {filteredStudents.map(student => (
                        <li
                            key={student.id}
                            onClick={() => onSelectStudent(student, 'full')} // Default to 'full' view for All Students
                            className="py-4 px-3 flex items-center transition duration-200 ease-in-out hover:bg-blue-50 rounded-xl cursor-pointer -mx-3"
                        >
                            <GraduationCap className="w-6 h-6 mr-3 text-blue-600 flex-shrink-0 drop-shadow-sm" />
                            <div className="flex-1 overflow-hidden">
                                <p className="text-lg font-semibold text-gray-900 truncate">{student.name}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    <span className="font-semibold mr-1">Roll No.:</span> {student.id}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// AddStudentForm.tsx
interface AddStudentFormProps {
    handleAddStudent: (studentData: {
        name: string;
        address: string | null;
        phone: string | null;
        admission_date: string;
        initial_paid_till: string;
        monthly_fee: number;
    }) => Promise<void>;
    setError: (message: string | null) => void;
}

const AddStudentForm: React.FC<AddStudentFormProps> = ({ handleAddStudent, setError }) => {
    const [name, setName] = useState<string>('');
    const [address, setAddress] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [admissionDate, setAdmissionDate] = useState<string>('');
    const [initialPaidTill, setInitialPaidTill] = useState<string>('');
    const [monthlyFee, setMonthlyFee] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !admissionDate || !initialPaidTill || monthlyFee === '') {
            setError("Please fill in Name, Admission Date, Initial Paid Till date, and Monthly Fee.");
            return;
        }
        await handleAddStudent({
            name,
            address: address || null,
            phone: phone || null,
            admission_date: admissionDate,
            initial_paid_till: initialPaidTill,
            monthly_fee: parseFloat(monthlyFee)
        });
        setName('');
        setAddress('');
        setPhone('');
        setAdmissionDate('');
        setInitialPaidTill('');
        setMonthlyFee('');
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 mx-auto w-full max-w-xl border border-blue-50">
            <h2 className="text-2xl font-bold mb-5 text-gray-800 text-center">Add New Student</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Student Name</label>
                    <input
                        type="text"
                        id="name"
                        className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Emily White"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address (Optional)</label>
                    <input
                        type="text"
                        id="address"
                        className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g., 45 Elm Street, Apt 3B"
                    />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone (for reminders)</label>
                    <input
                        type="tel"
                        id="phone"
                        className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g., +919876543210"
                    />
                </div>
                <div>
                    <label htmlFor="monthlyFee" className="block text-sm font-medium text-gray-700">Monthly Fee (₹)</label>
                    <input
                        type="number"
                        id="monthlyFee"
                        className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={monthlyFee}
                        onChange={(e) => setMonthlyFee(e.target.value)}
                        placeholder="e.g., 2000.00"
                        step="0.01"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="admissionDate" className="block text-sm font-medium text-gray-700">Admission Date</label>
                    <input
                        type="date"
                        id="admissionDate"
                        className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={admissionDate}
                        onChange={(e) => setAdmissionDate(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="initialPaidTill" className="block text-sm font-medium text-gray-700">Initial Paid Till Date</label>
                    <input
                        type="date"
                        id="initialPaidTill"
                        className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={initialPaidTill}
                        onChange={(e) => setInitialPaidTill(e.target.value)}
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition duration-300 ease-in-out text-lg tracking-wide transform hover:scale-105 active:scale-95"
                >
                    Add Student
                </button>
            </form>
        </div>
    );
};

// StudentDetail.tsx
interface StudentDetailProps {
    student: Student;
    payments: Payment[];
    onUpdatePayment: (studentId: number, paidTillDate: string) => Promise<void>;
    onBackToList: () => void;
    handleDeleteStudent: (studentId: number, studentName: string, passwordConfirmation: string) => Promise<void>; // Added for deletion
    setError: (message: string | null) => void;
    setSuccessMessage: (message: string | null) => void;
    pendingDataForStudent: {
        pending_months: number;
        pending_amount: number;
        paid_till: string | null;
    };
    viewMode: 'full' | 'pending-summary'; // New prop to control view
    currentLanguage: 'en' | 'ur'; // Added for language support
}

const StudentDetail: React.FC<StudentDetailProps> = ({ student, payments, onUpdatePayment, onBackToList, handleDeleteStudent, setError, setSuccessMessage, pendingDataForStudent, viewMode, currentLanguage }) => {
    const [newPaidTill, setNewPaidTill] = useState<string>('');
    const [isBiodataOpen, setIsBiodataOpen] = useState(false); // Collapsed by default
    const [isPaymentInfoOpen, setIsPaymentInfoOpen] = useState(false); // Collapsed by default
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');

    useEffect(() => {
        // Set initial collapse state based on viewMode
        if (viewMode === 'full') {
            setIsBiodataOpen(true);
            setIsPaymentInfoOpen(false);
        } else if (viewMode === 'pending-summary') {
            setIsBiodataOpen(false);
            setIsPaymentInfoOpen(true);
        }
    }, [viewMode]);

    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPaidTill) {
            setError(currentLanguage === 'en' ? "Please select a date to update." : "برائے مہربانی اپ ڈیٹ کرنے کے لیے ایک تاریخ منتخب کریں۔");
            return;
        }
        await onUpdatePayment(student.id, newPaidTill);
        setNewPaidTill('');
    };

    const handleClickWhatsAppReminder = () => {
        if (!student.phone) {
            setError(currentLanguage === 'en' ? `No phone number for ${student.name}.` : `${student.name} کے لیے کوئی فون نمبر نہیں ہے۔`);
            return;
        }
        const message = encodeURIComponent(
            currentLanguage === 'en'
                ? `Dear ${student.name}, this is a reminder regarding your pending fees of ₹${student.pending_amount} for ${student.pending_months} months. Last paid till: ${student.paid_till ? new Date(student.paid_till).toLocaleDateString() : 'N/A'}. Please clear your dues. Thank you.`
                : `عزیز ${student.name}، یہ آپ کی زیر التواء فیس ₹${student.pending_amount} کے بارے میں ایک یاد دہانی ہے جو ${student.pending_months} مہینوں کے لیے باقی ہے۔ آخری ادائیگی کی تاریخ: ${student.paid_till ? new Date(student.paid_till).toLocaleDateString('ar-u-nu-arab') : 'دستیاب نہیں'}۔ براہ کرم اپنی واجبات صاف کریں۔ شکریہ۔`
        );
        window.open(`https://wa.me/${student.phone}?text=${message}`, '_blank');
        setSuccessMessage(currentLanguage === 'en' ? `WhatsApp reminder simulated for ${student.name}.` : `${student.name} کے لیے واٹس ایپ یاد دہانی بھیجی گئی۔`);
    };

    const handleClickSMSReminder = () => {
        if (!student.phone) {
            setError(currentLanguage === 'en' ? `No phone number for ${student.name}.` : `${student.name} کے لیے کوئی فون نمبر نہیں ہے۔`);
            return;
        }
        const message = encodeURIComponent(
            currentLanguage === 'en'
                ? `Reminder: Dear ${student.name}, your pending fees are ₹${student.pending_amount}. Last paid till: ${student.paid_till ? new Date(student.paid_till).toLocaleDateString() : 'N/A'}. Please pay soon. Thank you.`
                : `یاد دہانی: عزیز ${student.name}، آپ کی زیر التواء فیس ₹${student.pending_amount} ہے۔ آخری ادائیگی کی تاریخ: ${student.paid_till ? new Date(student.paid_till).toLocaleDateString('ar-u-nu-arab') : 'دستیاب نہیں'}۔ براہ کرم جلد ادائیگی کریں۔ شکریہ۔`
        );
        window.open(`sms:${student.phone}?body=${message}`, '_blank');
        setSuccessMessage(currentLanguage === 'en' ? `SMS reminder simulated for ${student.name}.` : `${student.name} کے لیے ایس ایم ایس یاد دہانی بھیجی گئی۔`);
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
        setDeletePassword(''); // Clear password field
    };

    const handleConfirmDelete = async () => {
        if (!deletePassword) {
            setError(currentLanguage === 'en' ? "Please enter your password to confirm deletion." : "براہ کرم حذف کی تصدیق کے لیے اپنا پاس ورڈ درج کریں۔");
            return;
        }
        await handleDeleteStudent(student.id, student.name, deletePassword);
        setShowDeleteConfirm(false);
        setDeletePassword('');
        // After successful deletion, the parent component (App.tsx) will navigate back
    };

    if (viewMode === 'pending-summary') {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 mx-auto w-full max-w-xl border border-blue-50">
                <h2 className="text-2xl font-bold mb-5 text-gray-800 text-center">
                    {currentLanguage === 'en' ? 'Student Details:' : 'طالب علم کی تفصیلات:'} {student.name}
                </h2>
                <p className="text-sm text-gray-500 text-center mb-6">
                    {currentLanguage === 'en' ? 'Roll No.:' : 'رول نمبر:'} {student.id}
                </p>

                {pendingDataForStudent && (
                    <div className="bg-red-50 p-4 rounded-xl shadow-inner mb-6 space-y-2 text-gray-700 text-base border border-red-100">
                        <p className="text-red-600 font-bold text-lg flex items-center"><XCircle className="w-6 h-6 mr-3" />
                            <span className="font-semibold">{currentLanguage === 'en' ? 'Current Pending:' : 'موجودہ زیر التواء:'}</span> ₹{pendingDataForStudent.pending_amount} ({pendingDataForStudent.pending_months} {currentLanguage === 'en' ? 'months' : 'مہینے'})
                        </p>
                        <p className="text-sm text-gray-600 flex items-center pl-9"><CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                            {currentLanguage === 'en' ? 'Last Paid Till:' : 'آخری ادائیگی کی تاریخ:'} {pendingDataForStudent.paid_till ? new Date(pendingDataForStudent.paid_till).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                )}

                <h3 className="text-lg font-bold mb-3 text-gray-800 border-b-2 border-gray-100 pb-2 flex items-center">
                    <DollarSign className="w-6 h-6 mr-3 text-gray-600" />
                    {currentLanguage === 'en' ? 'Update Payment' : 'ادائیگی اپ ڈیٹ کریں'}
                </h3>
                <form onSubmit={handleUpdateSubmit} className="space-y-4 mb-6">
                    <div>
                        <label htmlFor="newPaidTill" className="block text-sm font-medium text-gray-700">
                            {currentLanguage === 'en' ? 'New Paid Till Date' : 'نئی ادائیگی کی تاریخ تک'}
                        </label>
                        <input
                            type="date"
                            id="newPaidTill"
                            className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                            value={newPaidTill}
                            onChange={(e) => setNewPaidTill(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition duration-300 ease-in-out text-lg tracking-wide transform hover:scale-105 active:scale-95"
                    >
                        {currentLanguage === 'en' ? 'Update Payment' : 'ادائیگی اپ ڈیٹ کریں'}
                    </button>
                </form>

                <h3 className="text-lg font-bold mb-3 text-gray-800 border-b-2 border-gray-100 pb-2 flex items-center">
                    <BellRing className="w-6 h-6 mr-3 text-gray-600" />
                    {currentLanguage === 'en' ? 'Send Reminder' : 'یاد دہانی بھیجیں'}
                </h3>
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={handleClickWhatsAppReminder}
                        className="flex-1 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition duration-300 ease-in-out transform hover:scale-105 active:scale-95"
                    >
                        <MessageSquare className="w-5 h-5 mr-2" /> WhatsApp
                    </button>
                    <button
                        onClick={handleClickSMSReminder}
                        className="flex-1 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition duration-300 ease-in-out transform hover:scale-105 active:scale-95"
                    >
                        <MessageSquareText className="w-5 h-5 mr-2" /> SMS
                    </button>
                </div>

                <button
                    onClick={onBackToList}
                    className="mt-6 w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition duration-300 ease-in-out text-lg tracking-wide transform hover:scale-105 active:scale-95"
                >
                    {currentLanguage === 'en' ? 'Back to All Students' : 'تمام طلباء پر واپس جائیں'}
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 mx-auto w-full max-w-xl border border-blue-50">
            <h2 className="text-2xl font-bold mb-5 text-gray-800 text-center">
                {currentLanguage === 'en' ? 'Student Details:' : 'طالب علم کی تفصیلات:'} {student.name}
            </h2>
            <p className="text-sm text-gray-500 text-center mb-6">
                {currentLanguage === 'en' ? 'Roll No.:' : 'رول نمبر:'} {student.id}
            </p>

            {/* Student Biodata Section */}
            <div className="border border-gray-200 rounded-xl mb-4 overflow-hidden shadow-sm">
                <button
                    className="w-full flex justify-between items-center bg-blue-50 p-4 font-semibold text-gray-700 hover:bg-blue-100 transition duration-150"
                    onClick={() => setIsBiodataOpen(!isBiodataOpen)}
                >
                    {currentLanguage === 'en' ? 'Student Biodata' : 'طالب علم کی بائیو ڈیٹا'}
                    {isBiodataOpen ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
                </button>
                {isBiodataOpen && (
                    <div className="p-4 space-y-2 text-gray-700 text-base border-t border-gray-200">
                        <p className="flex items-center"><MapPin className="w-5 h-5 mr-3 text-gray-500" /><span className="font-semibold">{currentLanguage === 'en' ? 'Address:' : 'پتہ:'}</span> {student.address || 'N/A'}</p>
                        <p className="flex items-center"><Phone className="w-5 h-5 mr-3 text-gray-500" /><span className="font-semibold">{currentLanguage === 'en' ? 'Phone:' : 'فون:'}</span> {student.phone || 'N/A'}</p>
                        <p className="flex items-center"><CalendarDays className="w-5 h-5 mr-3 text-gray-500" /><span className="font-semibold">{currentLanguage === 'en' ? 'Admission Date:' : 'داخلہ کی تاریخ:'}</span> {student.admission_date ? new Date(student.admission_date).toLocaleDateString() : 'N/A'}</p>
                        <p className="flex items-center"><DollarSign className="w-5 h-5 mr-3 text-gray-500" /><span className="font-semibold">{currentLanguage === 'en' ? 'Monthly Fee:' : 'ماہانہ فیس:'}</span> ₹{student.monthly_fee}</p>
                    </div>
                )}
            </div>

            {/* Payment History Section (Always shown in full view) */}
            <div className="border border-gray-200 rounded-xl mb-4 overflow-hidden shadow-sm">
                <button
                    className="w-full flex justify-between items-center bg-blue-50 p-4 font-semibold text-gray-700 hover:bg-blue-100 transition duration-150"
                    onClick={() => setIsPaymentInfoOpen(!isPaymentInfoOpen)}
                >
                    {currentLanguage === 'en' ? 'Payment History' : 'ادائیگی کی تاریخ'}
                    {isPaymentInfoOpen ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
                </button>
                {isPaymentInfoOpen && (
                    <div className="p-4 border-t border-gray-200">
                        {payments && payments.length === 0 ? (
                            <p className="text-gray-600 py-4 text-center">{currentLanguage === 'en' ? 'No payment records found for this student.' : 'اس طالب علم کے لیے کوئی ادائیگی ریکارڈ نہیں ملا۔'}</p>
                        ) : (
                            <ul className="divide-y divide-gray-100 mb-6">
                                {payments && payments.map(payment => (
                                    <li key={payment.id} className="py-2 text-gray-700 text-base flex items-center">
                                        <CheckCircle className="w-5 h-5 mr-3 text-green-500" />{currentLanguage === 'en' ? 'Paid Till:' : 'ادائیگی کی تاریخ تک:'} {payment.paid_till ? new Date(payment.paid_till).toLocaleDateString() : 'N/A'}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Student Button */}
            <button
                onClick={handleDeleteClick}
                className="mt-6 w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition duration-300 ease-in-out text-lg tracking-wide transform hover:scale-105 active:scale-95"
            >
                {currentLanguage === 'en' ? 'Delete Student' : 'طالب علم حذف کریں'}
            </button>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]">
                    <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4 text-center border border-gray-200">
                        <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                        <h3 className="text-xl font-bold mb-4 text-gray-800">{currentLanguage === 'en' ? 'Confirm Deletion' : 'حذف کی تصدیق کریں'}</h3>
                        <p className="text-gray-700 mb-4">
                            {currentLanguage === 'en' ? `Are you sure you want to delete ${student.name} (Roll No.: ${student.id})? This action cannot be undone.` : `${student.name} (رول نمبر: ${student.id}) کو حذف کرنا چاہتے ہیں؟ یہ عمل واپس نہیں لیا جا سکتا۔`}
                        </p>
                        <input
                            type="password"
                            placeholder={currentLanguage === 'en' ? 'Enter admin password' : 'ایڈمن پاس ورڈ درج کریں'}
                            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-red-500 focus:border-red-500"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                        />
                        <div className="flex justify-around gap-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-xl transition duration-150"
                            >
                                {currentLanguage === 'en' ? 'Cancel' : 'منسوخ کریں'}
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl transition duration-150"
                            >
                                {currentLanguage === 'en' ? 'Delete' : 'حذف کریں'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Dashboard.tsx
interface DashboardProps {
    students: Student[] | null;
    allPayments: Payment[] | null; // Renamed to allPayments for clarity
}

const Dashboard: React.FC<DashboardProps> = ({ students, allPayments }) => {
    if (!students || students.length === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 mx-auto w-full max-w-xl border border-blue-50 text-center text-gray-600">
                <BarChart2 className="w-12 h-12 mx-auto mb-4 text-blue-300" />
                <p className="text-lg font-medium">No student data available for the dashboard.</p>
            </div>
        );
    }

    // --- Data Preparation for Charts ---

    // 1. Pending vs. Cleared Students (Pie Chart)
    const totalStudents = students.length;
    const pendingStudentsCount = students.filter(s => s.pending_amount && s.pending_amount > 0).length;
    const clearedStudentsCount = totalStudents - pendingStudentsCount;

    const pieData = [
        { name: 'Cleared Fees', value: clearedStudentsCount },
        { name: 'Pending Fees', value: pendingStudentsCount },
    ];
    const PIE_COLORS = ['#82ca9d', '#ff7300']; // Green for cleared, Orange for pending

    // 2. Monthly Fee Distribution (Bar Chart)
    const feeDistributionMap = new Map<number, number>();
    students.forEach(student => {
        const fee = Math.floor(student.monthly_fee / 100) * 100; // Group by hundreds
        feeDistributionMap.set(fee, (feeDistributionMap.get(fee) || 0) + 1);
    });
    const feeDistributionData = Array.from(feeDistributionMap.entries())
        .map(([fee, count]) => ({ fee, count }))
        .sort((a, b) => a.fee - b.fee);

    // 3. Payments per Month (Line Chart)
    const paymentsPerMonthMap = new Map<string, number>(); // Key:,"%Y-%m"
    allPayments?.forEach(payment => {
        const date = new Date(payment.paid_till);
        const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        paymentsPerMonthMap.set(yearMonth, (paymentsPerMonthMap.get(yearMonth) || 0) + 1);
    });

    const paymentsPerMonthData = Array.from(paymentsPerMonthMap.entries())
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month)); // Sort chronologically

    // --- Render Dashboard ---
    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 mx-auto w-full max-w-2xl border border-blue-50">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Data Dashboard</h2>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 p-5 rounded-xl shadow-md text-center border border-blue-100">
                    <p className="text-xl font-bold text-blue-700">{totalStudents}</p>
                    <p className="text-sm text-gray-600">Total Students</p>
                </div>
                <div className="bg-red-50 p-5 rounded-xl shadow-md text-center border border-red-100">
                    <p className="text-xl font-bold text-red-700">{pendingStudentsCount}</p>
                    <p className="text-sm text-gray-600">Students with Pending Fees</p>
                </div>
                <div className="bg-green-50 p-5 rounded-xl shadow-md text-center border border-green-100">
                    <p className="text-xl font-bold text-green-700">{clearedStudentsCount}</p>
                    <p className="text-sm text-gray-600">Students with Cleared Fees</p>
                </div>
            </div>

            {/* Charts */}
            <div className="space-y-8">
                {/* Pending vs Cleared Pie Chart */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl shadow-md border border-purple-100">
                    <h3 className="text-lg font-bold mb-4 text-gray-800 text-center flex items-center justify-center">
                        <PieChart className="w-5 h-5 mr-2 text-purple-600" /> Pending vs. Cleared Students
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => [`${value} students`, name]} />
                            <Legend />
                        </RechartsPieChart>
                    </ResponsiveContainer>
                </div>

                {/* Monthly Fee Distribution Bar Chart */}
                <div className="bg-gradient-to-br from-teal-50 to-blue-50 p-5 rounded-xl shadow-md border border-teal-100">
                    <h3 className="text-lg font-bold mb-4 text-gray-800 text-center flex items-center justify-center">
                        <BarChart2 className="w-5 h-5 mr-2 text-teal-600" /> Monthly Fee Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={feeDistributionData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <XAxis dataKey="fee" label={{ value: "Monthly Fee (₹)", position: "insideBottom", offset: 0, dy: 10 }} />
                            <YAxis label={{ value: "Number of Students", angle: -90, position: "insideLeft", dx: -10 }} />
                            <Tooltip formatter={(value, name) => [value, `Students with ₹${name} Fee`]} />
                            <Bar dataKey="count" fill="#8884d8" name="Students" radius={[10, 10, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Payments Over Time Line Chart */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-xl shadow-md border border-indigo-100">
                    <h3 className="text-lg font-bold mb-4 text-gray-800 text-center flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" /> Payments Over Time
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                            data={paymentsPerMonthData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <XAxis dataKey="month" label={{ value: "Month", position: "insideBottom", offset: 0, dy: 10 }} />
                            <YAxis label={{ value: "Number of Payments", angle: -90, position: "insideLeft", dx: -10 }} />
                            <Tooltip formatter={(value, name) => [value, `Payments in ${name}`]} />
                            <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// ReminderList.tsx
interface ReminderListProps {
    allStudents: Student[] | null;
    setError: (message: string | null) => void;
    setSuccessMessage: (message: string | null) => void;
    currentLanguage: 'en' | 'ur'; // Added language prop
}

const ReminderList: React.FC<ReminderListProps> = ({ allStudents, setError, setSuccessMessage, currentLanguage }) => {
    const [reminderPeriod, setReminderPeriod] = useState<string>('all_pending'); // '1_week', '2_weeks', '1_month', 'all_pending'
    const [searchTerm, setSearchTerm] = useState<string>(''); // For search filter

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filteredStudents = allStudents?.filter(student => {
        // Filter by search term first
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;

        // Filter by pending status
        if (!(student.pending_amount && student.pending_amount > 0)) {
            return false; // Only show students with pending amounts
        }

        // Filter by reminder period
        const lastPaidDate = student.paid_till ? new Date(student.paid_till) : new Date(student.admission_date);
        lastPaidDate.setHours(0, 0, 0, 0); // Normalize to start of day

        // If no paid_till, we can consider current month as pending
        // The `pending_months` and `pending_amount` calculated by backend already reflect this
        // We want to find those whose _next_ payment is due soon, or who are already overdue.
        // The `paid_till` date indicates when their last payment covered.
        // So, if paid_till is "2024-05-31", then 2024-06-01 is the start of pending.

        // Calculate the first day of the month after the last paid date
        let nextPaymentDueDate = new Date(lastPaidDate);
        nextPaymentDueDate.setDate(1); // Set to 1st to avoid issues with month lengths
        nextPaymentDueDate.setMonth(lastPaymentDueDate.getMonth() + 1);
        nextPaymentDueDate.setHours(0, 0, 0, 0);

        if (reminderPeriod === 'all_pending') {
            return true; // Already filtered for pending_amount > 0
        } else if (reminderPeriod === '1_week') {
            const oneWeekFromNow = new Date(today);
            oneWeekFromNow.setDate(today.getDate() + 7);
            return nextPaymentDueDate <= oneWeekFromNow;
        } else if (reminderPeriod === '2_weeks') {
            const twoWeeksFromNow = new Date(today);
            twoWeeksFromNow.setDate(today.getDate() + 14);
            return nextPaymentDueDate <= twoWeeksFromNow;
        } else if (reminderPeriod === '1_month') {
            const oneMonthFromNow = new Date(today);
            oneMonthFromNow.setMonth(today.getMonth() + 1);
            return nextPaymentDueDate <= oneMonthFromNow;
        }
        return false;
    }) || [];

    const sortedReminderStudents = filteredStudents.sort((a, b) => {
        // Sort by how soon their next payment is due (or how long they've been pending)
        const dateA = a.paid_till ? new Date(a.paid_till).getTime() : new Date(a.admission_date).getTime();
        const dateB = b.paid_till ? new Date(b.paid_till).getTime() : new Date(b.admission_date).getTime();
        return dateA - dateB; // Earlier paid_till comes first
    });


    const handleSendReminder = (student: Student, type: 'whatsapp' | 'sms') => {
        if (!student.phone) {
            setError(currentLanguage === 'en' ? `No phone number available for ${student.name}. Cannot send reminder.` : `${student.name} کے لیے کوئی فون نمبر دستیاب نہیں ہے۔ یاد دہانی نہیں بھیجی جا سکتی۔`);
            setSuccessMessage(null);
            return;
        }

        const messageTemplate = currentLanguage === 'en'
            ? `Dear ${student.name}, this is a reminder regarding your pending fees of ₹${student.pending_amount} for ${student.pending_months} months. Last paid till: ${student.paid_till ? new Date(student.paid_till).toLocaleDateString() : 'N/A'}. Please clear your dues. Thank you.`
            : `عزیز ${student.name}، یہ آپ کی زیر التواء فیس ₹${student.pending_amount} کے بارے میں ایک یاد دہانی ہے جو ${student.pending_months} مہینوں کے لیے باقی ہے۔ آخری ادائیگی کی تاریخ: ${student.paid_till ? new Date(student.paid_till).toLocaleDateString('ar-u-nu-arab') : 'دستیاب نہیں'}۔ براہ کرم اپنی واجبات صاف کریں۔ شکریہ۔`;

        const encodedMessage = encodeURIComponent(messageTemplate);

        if (type === 'whatsapp') {
            window.open(`https://wa.me/${student.phone}?text=${encodedMessage}`, '_blank');
            setSuccessMessage(currentLanguage === 'en' ? `WhatsApp reminder simulated for ${student.name}.` : `${student.name} کے لیے واٹس ایپ یاد دہانی بھیجی گئی۔`);
        } else { // SMS
            window.open(`sms:${student.phone}?body=${encodedMessage}`, '_blank');
            setSuccessMessage(currentLanguage === 'en' ? `SMS reminder simulated for ${student.name}.` : `${student.name} کے لیے ایس ایم ایس یاد دہانی بھیجی گئی۔`);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 mx-auto w-full max-w-xl border border-blue-50">
            <h2 className="text-2xl font-bold mb-5 text-gray-800 text-center flex items-center justify-center">
                <BellRing className="w-7 h-7 mr-3 text-orange-500" />
                {currentLanguage === 'en' ? 'Reminders' : 'یاد دہانیاں'}
            </h2>

            {/* Search Input */}
            <div className="relative mb-4">
                <input
                    type="text"
                    placeholder={currentLanguage === 'en' ? "Search student by name..." : "طالب علم کا نام تلاش کریں..."}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            {/* Reminder Period Dropdown */}
            <div className="mb-6">
                <label htmlFor="reminderPeriod" className="block text-sm font-medium text-gray-700 mb-1">
                    {currentLanguage === 'en' ? 'Filter by:' : 'فلٹر کریں:'}
                </label>
                <select
                    id="reminderPeriod"
                    className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                    value={reminderPeriod}
                    onChange={(e) => setReminderPeriod(e.target.value)}
                >
                    <option value="all_pending">{currentLanguage === 'en' ? 'All Pending' : 'تمام زیر التواء'}</option>
                    <option value="1_week">{currentLanguage === 'en' ? 'Due within 1 Week' : '1 ہفتے کے اندر واجب الادا'}</option>
                    <option value="2_weeks">{currentLanguage === 'en' ? 'Due within 2 Weeks' : '2 ہفتوں کے اندر واجب الادا'}</option>
                    <option value="1_month">{currentLanguage === 'en' ? 'Due within 1 Month' : '1 ماہ کے اندر واجب الادا'}</option>
                </select>
            </div>

            {sortedReminderStudents.length === 0 ? (
                <div className="bg-green-50 p-6 rounded-xl shadow-inner text-center text-gray-600 mt-8">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-300" />
                    <p className="text-lg font-medium">
                        {currentLanguage === 'en' ? 'No students with pending fees based on filter.' : 'فلٹر کے مطابق کوئی زیر التواء فیس والے طلباء نہیں ہیں۔'}
                    </p>
                </div>
            ) : (
                <ul className="divide-y divide-gray-100">
                    {sortedReminderStudents.map(student => (
                        <li key={student.id} className="py-4 px-4 bg-orange-50/50 rounded-lg mb-3 shadow-sm border border-orange-100">
                            <div className="flex items-center mb-2">
                                <User className="w-5 h-5 mr-3 text-orange-600" />
                                <p className="font-semibold text-lg text-gray-800">{student.name} ({currentLanguage === 'en' ? 'Roll No.:' : 'رول نمبر:'} {student.id})</p>
                            </div>
                            <div className="text-sm text-gray-700 space-y-1 ml-8">
                                <p className="flex items-center"><CalendarDays className="w-4 h-4 mr-2 text-gray-500" />
                                    {currentLanguage === 'en' ? 'Last Paid Till:' : 'آخری ادائیگی:'} {student.paid_till ? new Date(student.paid_till).toLocaleDateString() : 'N/A'}
                                </p>
                                <p className="flex items-center text-red-600 font-bold"><DollarSign className="w-4 h-4 mr-2" />
                                    {currentLanguage === 'en' ? 'Pending:' : 'باقی:'} ₹{student.pending_amount} ({student.pending_months} {currentLanguage === 'en' ? 'months' : 'مہینے'})
                                </p>
                                {student.phone && (
                                    <p className="flex items-center"><Phone className="w-4 h-4 mr-2 text-gray-500" />
                                        {currentLanguage === 'en' ? 'Phone:' : 'فون:'} {student.phone}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-4 mt-4">
                                <button
                                    onClick={() => handleSendReminder(student, 'whatsapp')}
                                    className="flex-1 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out text-base transform hover:scale-105 active:scale-95"
                                >
                                    <MessageSquare className="w-5 h-5 mr-2" /> WhatsApp
                                </button>
                                <button
                                    onClick={() => handleSendReminder(student, 'sms')}
                                    className="flex-1 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out text-base transform hover:scale-105 active:scale-95"
                                >
                                    <MessageSquareText className="w-5 h-5 mr-2" /> SMS
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// AuthForm.tsx
interface AuthFormProps {
    handleLogin: (credentials: { username: string; password: string; }) => Promise<void>;
    setError: (message: string | null) => void;
    currentLanguage: 'en' | 'ur';
}

const AuthForm: React.FC<AuthFormProps> = ({ handleLogin, setError, currentLanguage }) => {
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
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 mx-auto w-full max-w-md border border-blue-50">
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

// ChangePasswordForm.tsx
interface ChangePasswordFormProps {
    handleChangePassword: (passwords: { old_password: string; new_password: string; }) => Promise<void>;
    setError: (message: string | null) => void;
    setSuccessMessage: (message: string | null) => void;
    currentLanguage: 'en' | 'ur';
    setCurrentPage: (page: string) => void; // Added for navigation
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ handleChangePassword, setError, setSuccessMessage, currentLanguage, setCurrentPage }) => {
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
            // Success message is set by handleChangePassword in App.tsx
            setCurrentPage('settings'); // Navigate back to settings after successful change
        } catch (error) {
            // Error handled by handleChangePassword, which sets global error state
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 mx-auto w-full max-w-xl border border-blue-50">
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


// SettingsPage.tsx - Updated to include Change Password option
interface SettingsPageProps {
    setCurrentPage: (page: string) => void;
    currentLanguage: 'en' | 'ur';
    toggleLanguage: () => void;
    handleChangePassword: (passwords: { old_password: string; new_password: string; }) => Promise<void>;
    setError: (message: string | null) => void;
    setSuccessMessage: (message: string | null) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ setCurrentPage, currentLanguage, toggleLanguage, handleChangePassword, setError, setSuccessMessage }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 mx-auto w-full max-w-xl border border-blue-50">
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

                {/* Placeholder for other future settings */}
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
                onClick={() => setCurrentPage('allStudents')}
                className="mt-6 w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition duration-300 ease-in-out text-lg tracking-wide transform hover:scale-105 active:scale-95"
            >
                {currentLanguage === 'en' ? 'Back to Main' : 'واپس مین پر جائیں'}
            </button>
        </div>
    );
};


// --- App.tsx (Main Application Logic) ---
const App = () => {
    // State to manage the current view/page in the single-page application
    const [currentPage, setCurrentPage] = useState('login'); // Default to login page
    // State to store the list of all students
    const [students, setStudents] = useState<Student[] | null>(null);
    // State to store the list of students with pending fees
    const [pendingStudents, setPendingStudents] = useState<Student[] | null>(null);
    // State to store details of a single student when viewing their payments
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    // State to store payment records for the selected student
    const [studentPayments, setStudentPayments] = useState<StudentPaymentDetailsResponse | null>(null);
    // State to store all payment records (for dashboard analytics)
    const [allPayments, setAllPayments] = useState<Payment[] | null>(null);
    // State for loading indicators
    const [loading, setLoading] = useState(false);
    // State for error messages
    const [error, setError] = useState<string | null>(null);
    // State for success messages
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    // State for language
    const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ur'>('en');
    // State for login status
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); // Start as false, require login

    // Base URL for the Flask API - Use your actual PythonAnywhere URL here
    const API_BASE_URL = 'https://bahshat.pythonanywhere.com'; // User's provided URL

    // Toggle language function
    const toggleLanguage = () => {
        setCurrentLanguage(prevLang => prevLang === 'en' ? 'ur' : 'en');
    };

    // MessageDisplay Component
    interface MessageDisplayProps {
        message: string | null;
        type: 'error' | 'success';
    }

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

    // Data fetching functions (using useCallback for memoization)
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
                    // Not a JSON error, keep errorText
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

    const fetchAllStudents = useCallback(async () => {
        if (!isLoggedIn) return; // Only fetch if logged in
        const data = await fetchData<Student[]>(`${API_BASE_URL}/students`, "Failed to load students.");
        setStudents(data);
    }, [fetchData, API_BASE_URL, isLoggedIn]);

    const fetchPendingStudents = useCallback(async () => {
        if (!isLoggedIn) return; // Only fetch if logged in
        const data = await fetchData<Student[]>(`${API_BASE_URL}/students/pending`, "Failed to load pending students.");
        setPendingStudents(data);
    }, [fetchData, API_BASE_URL, isLoggedIn]);

    const fetchAllPayments = useCallback(async () => {
        if (!isLoggedIn) return; // Only fetch if logged in
        const data = await fetchData<Payment[]>(`${API_BASE_URL}/payments`, "Failed to load all payments.");
        setAllPayments(data);
    }, [fetchData, API_BASE_URL, isLoggedIn]);


    const fetchStudentPayments = useCallback(async (studentId: number) => {
        if (!isLoggedIn) return; // Only fetch if logged in
        const fetchedData = await fetchData<StudentPaymentDetailsResponse>(`${API_BASE_URL}/students/${studentId}/payments`, "Failed to load payment details.");
        if (fetchedData) {
            setSelectedStudent(fetchedData.student);
            setStudentPayments(fetchedData);
        } else {
            setSelectedStudent(null);
            setStudentPayments(null);
        }
    }, [fetchData, API_BASE_URL, isLoggedIn]);


    // Mutation functions
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
                    // Not a JSON error, keep errorText
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
            setCurrentPage('allStudents'); // Navigate to home page after successful login
            // Fetch initial data after successful login
            fetchAllStudents();
            fetchPendingStudents();
            fetchAllPayments();
        } catch (e) { /* Error handled by handleMutation */ }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setCurrentPage('login'); // Redirect to login page on logout
        setStudents(null);
        setPendingStudents(null);
        setSelectedStudent(null);
        setStudentPayments(null);
        setAllPayments(null);
        setSuccessMessage(currentLanguage === 'en' ? "Logged out successfully." : "کامیابی سے لاگ آوٹ ہو گیا۔");
    };

    const handleChangePassword = async (passwords: { old_password: string; new_password: string; }) => {
        try {
            await handleMutation(
                `${API_BASE_URL}/change_password`,
                'PUT',
                passwords,
                currentLanguage === 'en' ? "Password changed successfully!" : "پاس ورڈ کامیابی سے تبدیل ہو گیا۔",
                currentLanguage === 'en' ? "Failed to change password. Please check old password." : "پاس ورڈ تبدیل کرنے میں ناکام۔ براہ کرم پرانا پاس ورڈ چیک کریں۔"
            );
            setCurrentPage('settings'); // Stay on settings or go back to main if preferred
        } catch (e) { /* Error handled by handleMutation */ }
    };


    const handleAddStudent = async (studentData: {
        name: string;
        address: string | null;
        phone: string | null;
        admission_date: string;
        initial_paid_till: string;
        monthly_fee: number;
    }) => {
        try {
            await handleMutation(
                `${API_BASE_URL}/students`,
                'POST',
                studentData,
                currentLanguage === 'en' ? "Student added successfully!" : "طالب علم کامیابی سے شامل کر دیا گیا!",
                currentLanguage === 'en' ? "Failed to add student." : "طالب علم شامل کرنے میں ناکام۔"
            );
            setCurrentPage('allStudents');
            fetchAllStudents();
            fetchPendingStudents();
            fetchAllPayments();
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
            fetchAllStudents();
            fetchPendingStudents();
            fetchAllPayments();
        } catch (e) { /* Error handled by handleMutation */ }
    };

    const handleDeleteStudent = async (studentId: number, studentName: string, passwordConfirmation: string) => {
        try {
            await handleMutation(
                `${API_BASE_URL}/students/${studentId}`,
                'DELETE',
                { password: passwordConfirmation }, // Pass password for backend verification
                currentLanguage === 'en' ? `Student '${studentName}' deleted successfully!` : `طالب علم '${studentName}' کامیابی سے حذف کر دیا گیا!`,
                currentLanguage === 'en' ? `Failed to delete student '${studentName}'. Invalid password or other error.` : `طالب علم '${studentName}' حذف کرنے میں ناکام۔ غلط پاس ورڈ یا کوئی اور خرابی۔`
            );
            setCurrentPage('allStudents'); // Navigate back after deletion
            fetchAllStudents(); // Refresh student list
            fetchPendingStudents(); // Refresh pending list
            fetchAllPayments(); // Refresh payments for dashboard
            setSelectedStudent(null);
            setStudentPayments(null);
        } catch (e) { /* Error handled by handleMutation */ }
    };


    // Initial data fetch only if logged in
    useEffect(() => {
        if (isLoggedIn) {
            fetchAllStudents();
            fetchPendingStudents();
            fetchAllPayments();
        }
    }, [isLoggedIn, fetchAllStudents, fetchPendingStudents, fetchAllPayments]);

    const renderPage = () => {
        if (!isLoggedIn) {
            return <AuthForm handleLogin={handleLogin} setError={setError} currentLanguage={currentLanguage} />;
        }

        if (loading) return null; // LoadingOverlay covers this

        switch (currentPage) {
            case 'allStudents':
                return (
                    <StudentList
                        students={students}
                        title={currentLanguage === 'en' ? "All Students" : "تمام طلباء"}
                        onSelectStudent={(s, mode) => { // Updated to pass mode
                            setSelectedStudent(s);
                            setCurrentPage('studentDetail');
                            fetchStudentPayments(s.id);
                            localStorage.setItem('studentDetailViewMode', mode); // Store mode in local storage
                        }}
                    />
                );
            case 'pendingStudents':
                return (
                    <StudentList
                        students={pendingStudents}
                        title={currentLanguage === 'en' ? "Students with Pending Fees" : "زیر التواء فیس والے طلباء"}
                        onSelectStudent={(s, mode) => { // Updated to pass mode
                            setSelectedStudent(s);
                            setCurrentPage('studentDetail');
                            fetchStudentPayments(s.id);
                            localStorage.setItem('studentDetailViewMode', mode); // Store mode in local storage
                        }}
                    />
                );
            case 'addStudent':
                return <AddStudentForm handleAddStudent={handleAddStudent} setError={setError} />;
            case 'studentDetail':
                if (!selectedStudent || studentPayments === null) {
                    return (
                        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 mx-auto w-full max-w-xl border border-blue-50 text-center text-gray-600">
                            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-lg font-medium">
                                {currentLanguage === 'en' ? 'Loading student details or an error occurred.' : 'طالب علم کی تفصیلات لوڈ ہو رہی ہیں یا کوئی خرابی پیش آئی ہے۔'}
                            </p>
                        </div>
                    );
                }
                // Determine viewMode based on localStorage or default to 'full'
                const studentDetailViewMode = localStorage.getItem('studentDetailViewMode') as 'full' | 'pending-summary' || 'full';

                return (
                    <StudentDetail
                        student={selectedStudent}
                        payments={studentPayments.payments}
                        onUpdatePayment={handleUpdatePayment}
                        onBackToList={() => {
                            setCurrentPage('allStudents');
                            localStorage.removeItem('studentDetailViewMode'); // Clear mode on back
                        }}
                        handleDeleteStudent={handleDeleteStudent}
                        setError={setError}
                        setSuccessMessage={setSuccessMessage}
                        pendingDataForStudent={{
                            pending_months: studentPayments.pending_months,
                            pending_amount: studentPayments.pending_amount,
                            paid_till: studentPayments.payments.length > 0 ? studentPayments.payments[0].paid_till : null
                        }}
                        viewMode={studentDetailViewMode} // Pass the determined viewMode
                        currentLanguage={currentLanguage}
                    />
                );
            case 'dashboard':
                return <Dashboard students={students} allPayments={allPayments} />;
            case 'reminders': // New route for reminders
                return <ReminderList allStudents={students} setError={setError} setSuccessMessage={setSuccessMessage} currentLanguage={currentLanguage} />;
            case 'settings':
                return <SettingsPage
                            setCurrentPage={setCurrentPage}
                            currentLanguage={currentLanguage}
                            toggleLanguage={toggleLanguage}
                            handleChangePassword={handleChangePassword}
                            setError={setError}
                            setSuccessMessage={setSuccessMessage}
                        />;
            case 'changePassword': // New route for change password
                return <ChangePasswordForm
                            handleChangePassword={handleChangePassword}
                            setError={setError}
                            setSuccessMessage={setSuccessMessage}
                            currentLanguage={currentLanguage}
                            setCurrentPage={setCurrentPage} // Pass setCurrentPage for navigation back
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
                @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400..700&display=swap'); /* For Urdu font */
                body {
                    font-family: 'Inter', sans-serif;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    color: #333;
                }
                .lang-ur { /* Apply this class to elements needing Urdu font */
                    font-family: 'Noto Nastaliq Urdu', serif;
                    direction: rtl; /* Right-to-left for Urdu */
                    text-align: right; /* Adjust text alignment for RTL */
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

            {/* Header and Navigation visibility is controlled by isLoggedIn */}
            <Header setCurrentPage={setCurrentPage} currentLanguage={currentLanguage} toggleLanguage={toggleLanguage} isLoggedIn={isLoggedIn} handleLogout={handleLogout} />

            <main className={`max-w-4xl mx-auto px-4 pt-4 ${currentLanguage === 'ur' ? 'lang-ur' : ''}`}>
                <MessageDisplay message={error} type="error" />
                <MessageDisplay message={successMessage} type="success" />
                {renderPage()}
            </main>

            <Navigation
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                fetchPendingStudents={fetchPendingStudents}
                fetchAllStudents={fetchAllStudents}
                currentLanguage={currentLanguage}
                isLoggedIn={isLoggedIn}
            />
        </div>
    );
};

export default App;
