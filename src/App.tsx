import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Home, Clock, UserPlus, BookOpen, GraduationCap, Search,
    DollarSign, MapPin, Phone, CalendarDays, CheckCircle, XCircle,
    BarChart2, PieChart, TrendingUp, Settings, ChevronDown, ChevronUp, Globe, LogOut, Lock, BellRing, User, MessageSquare, MessageSquareText, ArrowLeftCircle // Icons for dashboard, settings, expand/collapse, reminders, user, WhatsApp, SMS, Back Arrow
} from 'lucide-react'; // Ensure 'lucide-react' is installed via npm/yarn
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// --- Utility Functions ---
const formatDate = (dateString: string | Date | undefined | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A'; // Handle invalid date strings
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit', year: 'numeric' }; // Changed to 'numeric' for YYYY
    return date.toLocaleDateString('en-US', options);
};

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
    isLoggedIn: boolean; // Added isLoggedIn prop
    currentPage: string; // Added to conditionally show back button
}

const Header: React.FC<HeaderProps> = ({ setCurrentPage, currentLanguage, isLoggedIn, currentPage }) => {
    const title = currentLanguage === 'en' ? 'Maktab Fees Portal' : 'مکتب فیس پورٹل';
    const organizationName = currentLanguage === 'en' ? 'Anjuman Abu Hurairah' : 'انجمن ابو ہریرہ';

    // Pages where a back button should be shown
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
                    <div className="w-8"></div> // Placeholder to keep title centered when no back button
                )}
                <h1 className="text-xl font-extrabold text-center tracking-wide leading-tight flex-grow drop-shadow-lg mx-2">
                    {title}
                </h1>
                <div className="flex space-x-2 flex-shrink-0">
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

// StudentList.tsx
interface StudentListProps {
    students: Student[] | null;
    title: string;
    onSelectStudent: (student: Student, viewMode: 'full' | 'pending-summary') => void;
    currentLanguage: 'en' | 'ur';
}

const StudentList: React.FC<StudentListProps> = ({ students, title, onSelectStudent, currentLanguage }) => {
    const [searchTerm, setSearchTerm] = useState<string>('');

    const filteredStudents = students?.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="mb-6 mx-auto w-full"> {/* Removed px-4 and max-w-xl */}
            <h2 className="text-2xl font-bold mb-5 text-gray-800 text-center">{title}</h2>

            {/* Search Input - now its own card */}
            <div className="relative mb-4 bg-white p-6 rounded-2xl shadow-xl border border-blue-50">
                <input
                    type="text"
                    placeholder={currentLanguage === 'en' ? "Search students by name..." : "طالب علم کا نام تلاش کریں..."}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            {!students || students.length === 0 ? (
                <div className="bg-blue-50 p-6 rounded-xl shadow-inner text-center text-gray-600 mt-4">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-blue-300" />
                    <p className="text-lg font-medium">{currentLanguage === 'en' ? 'No student records found.' : 'طالب علم کے کوئی ریکارڈ نہیں ملے۔'}</p>
                </div>
            ) : filteredStudents.length === 0 ? (
                <div className="bg-blue-50 p-6 rounded-xl shadow-inner text-center text-gray-600 mt-4">
                    <Search className="w-12 h-12 mx-auto mb-4 text-blue-300" />
                    <p className="text-lg font-medium">{currentLanguage === 'en' ? 'No students match your search criteria.' : 'آپ کے تلاش کے معیار سے کوئی طالب علم نہیں ملا۔'}</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-blue-50 overflow-hidden"> {/* Removed max-h and overflow-y-auto */}
                    <ul className="divide-y divide-blue-50">
                        {filteredStudents.map(student => (
                            <li
                                key={student.id}
                                onClick={() => onSelectStudent(student, 'full')} // Default to 'full' view for All Students
                                className="py-4 px-3 flex items-center justify-between transition duration-200 ease-in-out hover:bg-blue-50 rounded-xl cursor-pointer -mx-3"
                            >
                                <div className="flex items-center flex-1 min-w-0">
                                    <GraduationCap className="w-6 h-6 mr-3 text-blue-600 flex-shrink-0 drop-shadow-sm" />
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-lg font-semibold text-gray-900 truncate">
                                            {student.name}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {student.address || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

// AddStudentForm.tsx
interface AddStudentFormProps {
    studentData: {
        name: string;
        address: string | null;
        phone: string | null;
        admission_date: string;
        initial_paid_till: string;
        monthly_fee: number;
    };
    setStudentData: React.Dispatch<React.SetStateAction<{
        name: string;
        address: string | null;
        phone: string | null;
        admission_date: string;
        initial_paid_till: string;
        monthly_fee: number;
    }>>;
    setError: (message: string | null) => void;
    currentLanguage: 'en' | 'ur';
}

const AddStudentForm: React.FC<AddStudentFormProps> = ({ studentData, setStudentData, setError, currentLanguage }) => {
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        // Initialize if not already set (e.g., on first render or page refresh)
        if (!studentData.admission_date) {
            setStudentData(prev => ({ ...prev, admission_date: today }));
        }
        if (studentData.monthly_fee === undefined || studentData.monthly_fee === null || isNaN(studentData.monthly_fee)) { // Check for undefined, null, or NaN
            setStudentData(prev => ({ ...prev, monthly_fee: 400 })); // Default monthly fee to 400
        }
    }, [studentData.admission_date, studentData.monthly_fee, setStudentData, today]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setStudentData(prev => ({ ...prev, [id]: value }));
    };

    const handleMonthlyFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStudentData(prev => ({ ...prev, monthly_fee: parseFloat(e.target.value) || 0 }));
    };


    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 mx-auto w-full overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}> {/* Removed px-4 and max-w-xl */}
            <h2 className="text-2xl font-bold mb-5 text-gray-800 text-center">{currentLanguage === 'en' ? 'Add New Student' : 'نیا طالب علم شامل کریں'}</h2>
            <form className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:w-1/3 sm:min-w-[120px] mb-1 sm:mb-0">
                        {currentLanguage === 'en' ? 'Student Name' : 'طالب علم کا نام'}
                    </label>
                    <input
                        type="text"
                        id="name"
                        className="flex-1 mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={studentData.name}
                        onChange={handleChange}
                        placeholder={currentLanguage === 'en' ? "e.g., Emily White" : "مثلاً، ایملی وائٹ"}
                        required
                    />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start"> {/* Use items-start for textarea */}
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 sm:w-1/3 sm:min-w-[120px] mb-1 sm:mb-0 pt-2">
                        {currentLanguage === 'en' ? 'Address (Optional)' : 'پتہ (اختیاری)'}
                    </label>
                    <textarea
                        id="address"
                        rows={3} // 3 line height
                        className="flex-1 mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out resize-y"
                        value={studentData.address || ''}
                        onChange={handleChange}
                        placeholder={currentLanguage === 'en' ? "e.g., 45 Elm Street, Apt 3B" : "مثلاً، 45 ایلم اسٹریٹ، اپارٹمنٹ 3 بی"}
                    ></textarea>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 sm:w-1/3 sm:min-w-[120px] mb-1 sm:mb-0">
                        {currentLanguage === 'en' ? 'Phone (for reminders)' : 'فون (یاد دہانیوں کے لیے)'}
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        className="flex-1 mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={studentData.phone || ''}
                        onChange={handleChange}
                        placeholder={currentLanguage === 'en' ? "e.g., +919876543210" : "مثلاً، +919876543210"}
                    />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                    <label htmlFor="monthly_fee" className="block text-sm font-medium text-gray-700 sm:w-1/3 sm:min-w-[120px] mb-1 sm:mb-0">
                        {currentLanguage === 'en' ? 'Monthly Fee (₹)' : 'ماہانہ فیس (₹)'}
                    </label>
                    <input
                        type="number"
                        id="monthly_fee"
                        className="flex-1 mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={studentData.monthly_fee}
                        onChange={handleMonthlyFeeChange}
                        placeholder={currentLanguage === 'en' ? "e.g., 2000.00" : "مثلاً، 2000.00"}
                        step="0.01"
                        required
                    />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                    <label htmlFor="admission_date" className="block text-sm font-medium text-gray-700 sm:w-1/3 sm:min-w-[120px] mb-1 sm:mb-0">
                        {currentLanguage === 'en' ? 'Admission Date' : 'داخلہ کی تاریخ'}
                    </label>
                    <input
                        type="date"
                        id="admission_date"
                        className="flex-1 mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={studentData.admission_date}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                    <label htmlFor="initial_paid_till" className="block text-sm font-medium text-gray-700 sm:w-1/3 sm:min-w-[120px] mb-1 sm:mb-0">
                        {currentLanguage === 'en' ? 'Initial Paid Till Date' : 'ابتدائی ادائیگی کی تاریخ تک'}
                    </label>
                    <input
                        type="date"
                        id="initial_paid_till"
                        className="flex-1 mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={studentData.initial_paid_till}
                        onChange={handleChange}
                        required
                    />
                </div>
            </form>
        </div>
    );
};


// StudentDetail.tsx
interface StudentDetailProps {
    student: Student;
    payments: Payment[];
    onUpdatePayment: (studentId: number, paidTillDate: string) => Promise<void>;
    handleDeleteStudent: (studentId: number, studentName: string, passwordConfirmation: string) => Promise<void>;
    setError: (message: string | null) => void;
    setSuccessMessage: (message: string | null) => void;
    pendingDataForStudent: {
        pending_months: number;
        pending_amount: number;
        paid_till: string | null;
    };
    viewMode: 'full' | 'pending-summary';
    currentLanguage: 'en' | 'ur';
}

const StudentDetail: React.FC<StudentDetailProps> = ({ student, payments, onUpdatePayment, handleDeleteStudent, setError, setSuccessMessage, pendingDataForStudent, viewMode, currentLanguage }) => {
    const [newPaidTill, setNewPaidTill] = useState<string>('');
    const [isBiodataOpen, setIsBiodataOpen] = useState(viewMode === 'full');
    const [isCurrentPendingOpen, setIsCurrentPendingOpen] = useState(viewMode === 'pending-summary');
    const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = useState(viewMode === 'pending-summary');
    const [isUpdatePaymentOpen, setIsUpdatePaymentOpen] = useState(viewMode === 'pending-summary');
    const [isReminderSectionOpen, setIsReminderSectionOpen] = useState(viewMode === 'pending-summary');

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');

    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPaidTill) {
            setError(currentLanguage === 'en' ? "Please select a date to update." : "برائے مہربانی اپ ڈیٹ کرنے کے لیے ایک تاریخ منتخب کریں۔");
            return;
        }
        await onUpdatePayment(student.id, newPaidTill);
        setNewPaidTill('');
    };

    const calculateNewPaidTill = (months: number) => {
        const baseDate = pendingDataForStudent.paid_till ? new Date(pendingDataForStudent.paid_till) : new Date(student.admission_date);
        
        let newDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);

        const today = new Date();
        today.setHours(0,0,0,0);
        
        if (baseDate <= today) {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        
        newDate.setMonth(newDate.getMonth() + (months -1)); 

        newDate.setDate(new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate());
        
        setNewPaidTill(newDate.toISOString().split('T')[0]);
    };

    const handleClickWhatsAppReminder = () => {
        if (!student.phone) {
            setError(currentLanguage === 'en' ? `No phone number for ${student.name}.` : `${student.name} کے لیے کوئی فون نمبر نہیں ہے۔`);
            return;
        }
        const message = encodeURIComponent(
            currentLanguage === 'en'
                ? `Dear ${student.name}, this is a reminder regarding your pending fees of ₹${student.pending_amount} for ${student.pending_months} months. Last paid till: ${formatDate(student.paid_till)}. Please clear your dues. Thank you.`
                : `عزیز ${student.name}، یہ آپ کی زیر التواء فیس ₹${student.pending_amount} کے بارے میں ایک یاد دہانی ہے جو ${student.pending_months} مہینوں کے لیے باقی ہے۔ آخری ادائیگی کی تاریخ: ${formatDate(student.paid_till)}۔ براہ کرم اپنی واجبات صاف کریں۔ شکریہ۔`
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
                ? `Reminder: Dear ${student.name}, your pending fees are ₹${student.pending_amount}. Last paid till: ${formatDate(student.paid_till)}. Please pay soon. Thank you.`
                : `یاد دہانی: عزیز ${student.name}، آپ کی زیر التواء فیس ₹${student.pending_amount} ہے۔ آخری ادائیگی کی تاریخ: ${formatDate(student.paid_till)}۔ براہ کرم جلد ادائیگی کریں۔ شکریہ۔`
        );
        window.open(`sms:${student.phone}?body=${message}`, '_blank');
        setSuccessMessage(currentLanguage === 'en' ? `SMS reminder simulated for ${student.name}.` : `${student.name} کے لیے ایس ایم ایس یاد دہانی بھیجی گئی۔`);
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
        setDeletePassword('');
    };

    const handleConfirmDelete = async () => {
        if (!deletePassword) {
            setError(currentLanguage === 'en' ? "Please enter your password to confirm deletion." : "براہ کرم حذف کی تصدیق کے لیے اپنا پاس ورڈ درج کریں۔");
            return;
        }
        await handleDeleteStudent(student.id, student.name, deletePassword);
        setShowDeleteConfirm(false);
        setDeletePassword('');
    };

    const isFeesCleared = pendingDataForStudent.pending_amount === 0 || pendingDataForStudent.pending_amount === undefined;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 mx-auto w-full border border-blue-50"> {/* Removed max-w-xl */}
            <h2 className="text-2xl font-bold mb-2 text-gray-800 text-center">
                {student.name}
            </h2>

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
                        <p className="flex items-center"><User className="w-5 h-5 mr-3 text-gray-500" /><span className="font-semibold">{currentLanguage === 'en' ? 'Roll No.:' : 'رول نمبر:'}</span> {student.id}</p> {/* Moved Roll No. here */}
                        <p className="flex items-center"><MapPin className="w-5 h-5 mr-3 text-gray-500" /><span className="font-semibold">{currentLanguage === 'en' ? 'Address:' : 'پتہ:'}</span> {student.address || 'N/A'}</p>
                        <p className="flex items-center"><Phone className="w-5 h-5 mr-3 text-gray-500" /><span className="font-semibold">{currentLanguage === 'en' ? 'Phone:' : 'فون:'}</span> <a href={`tel:${student.phone}`} className="text-blue-600 hover:underline">{student.phone || 'N/A'}</a></p>
                        <p className="flex items-center"><CalendarDays className="w-5 h-5 mr-3 text-gray-500" /><span className="font-semibold">{currentLanguage === 'en' ? 'Admission Date:' : 'داخلہ کی تاریخ:'}</span> {formatDate(student.admission_date)}</p>
                        <p className="flex items-center"><DollarSign className="w-5 h-5 mr-3 text-gray-500" /><span className="font-semibold">{currentLanguage === 'en' ? 'Monthly Fee:' : 'ماہانہ فیس:'}</span> ₹{student.monthly_fee}</p>
                    </div>
                )}
            </div>

            {/* Current Pending/Cleared Information Section */}
            <div className="border border-gray-200 rounded-xl mb-4 overflow-hidden shadow-sm">
                <button
                    className="w-full flex justify-between items-center bg-blue-50 p-4 font-semibold text-gray-700 hover:bg-blue-100 transition duration-150"
                    onClick={() => setIsCurrentPendingOpen(!isCurrentPendingOpen)}
                >
                    {currentLanguage === 'en' ? 'Current Status' : 'موجودہ حیثیت'}
                    {isCurrentPendingOpen ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
                </button>
                {isCurrentPendingOpen && (
                    <div className="p-4 border-t border-gray-200">
                        {isFeesCleared ? (
                            <div className="bg-green-50 p-4 rounded-xl shadow-inner mb-6 space-y-2 text-gray-700 text-base border border-green-100 flex items-center flex-wrap">
                                <CheckCircle className="w-8 h-8 mr-3 text-green-600 flex-shrink-0" />
                                <div className="flex-grow">
                                    <p className="font-bold text-lg text-green-700">
                                        {currentLanguage === 'en' ? 'Fees Cleared!' : 'فیس صاف شدہ!'}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {currentLanguage === 'en' ? 'Last Paid Till:' : 'آخری ادائیگی کی تاریخ تک:'} {formatDate(pendingDataForStudent.paid_till)}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-red-50 p-4 rounded-xl shadow-inner mb-6 space-y-2 text-gray-700 text-base border border-red-100 flex items-center flex-wrap">
                                <XCircle className="w-8 h-8 mr-3 text-red-600 flex-shrink-0" />
                                <div className="flex-grow">
                                    <p className="font-bold text-lg text-red-700">
                                        {currentLanguage === 'en' ? 'Pending:' : 'باقی:'} ₹{pendingDataForStudent.pending_amount}
                                        <span className="font-normal text-sm ml-2">({pendingDataForStudent.pending_months} {currentLanguage === 'en' ? 'months' : 'مہینے'})</span>
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {currentLanguage === 'en' ? 'Last Paid Till:' : 'آخری ادائیگی کی تاریخ تک:'} {formatDate(pendingDataForStudent.paid_till)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Payment History Section */}
            <div className="border border-gray-200 rounded-xl mb-4 overflow-hidden shadow-sm">
                <button
                    className="w-full flex justify-between items-center bg-blue-50 p-4 font-semibold text-gray-700 hover:bg-blue-100 transition duration-150"
                    onClick={() => setIsPaymentHistoryOpen(!isPaymentHistoryOpen)}
                >
                    {currentLanguage === 'en' ? 'Payment History' : 'ادائیگی کی تاریخ'}
                    {isPaymentHistoryOpen ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
                </button>
                {isPaymentHistoryOpen && (
                    <div className="p-4 border-t border-gray-200">
                        {payments && payments.length === 0 ? (
                            <p className="text-gray-600 py-4 text-center">{currentLanguage === 'en' ? 'No payment records found for this student.' : 'اس طالب علم کے لیے کوئی ادائیگی ریکارڈ نہیں ملا۔'}</p>
                        ) : (
                            <ul className="divide-y divide-gray-100 mb-6">
                                {payments && payments.map(payment => (
                                    <li key={payment.id} className="py-2 text-gray-700 text-base flex items-center">
                                        <CheckCircle className="w-5 h-5 mr-3 text-green-500" />{currentLanguage === 'en' ? 'Paid Till:' : 'ادائیگی کی تاریخ تک:'} {formatDate(payment.paid_till)}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>

            {/* Update Payment Section */}
            <div className="border border-gray-200 rounded-xl mb-4 overflow-hidden shadow-sm">
                <button
                    className="w-full flex justify-between items-center bg-blue-50 p-4 font-semibold text-gray-700 hover:bg-blue-100 transition duration-150"
                    onClick={() => setIsUpdatePaymentOpen(!isUpdatePaymentOpen)}
                >
                    {currentLanguage === 'en' ? 'Update Payment' : 'ادائیگی اپ ڈیٹ کریں'}
                    {isUpdatePaymentOpen ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
                </button>
                {isUpdatePaymentOpen && (
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex flex-wrap gap-2 justify-center mb-4">
                            <button
                                onClick={() => calculateNewPaidTill(3)}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition duration-150 ease-in-out flex-1 min-w-[100px] sm:flex-none"
                            >
                                {currentLanguage === 'en' ? 'Clear 3 Months' : '3 ماہ کی ادائیگی'}
                            </button>
                            <button
                                onClick={() => calculateNewPaidTill(6)}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition duration-150 ease-in-out flex-1 min-w-[100px] sm:flex-none"
                            >
                                {currentLanguage === 'en' ? 'Clear 6 Months' : '6 ماہ کی ادائیگی'}
                            </button>
                            <button
                                onClick={() => calculateNewPaidTill(12)}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition duration-150 ease-in-out flex-1 min-w-[100px] sm:flex-none"
                            >
                                {currentLanguage === 'en' ? 'Clear 1 Year' : '1 سال کی ادائیگی'}
                            </button>
                        </div>
                        <form onSubmit={handleUpdateSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="newPaidTill" className="block text-sm font-medium text-gray-700">
                                    {currentLanguage === 'en' ? 'Custom Paid Till Date' : 'حسب ضرورت ادائیگی کی تاریخ تک'}
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
                    </div>
                )}
            </div>

            {/* Send Reminder Section */}
            <div className="border border-gray-200 rounded-xl mb-4 overflow-hidden shadow-sm">
                <button
                    className="w-full flex justify-between items-center bg-blue-50 p-4 font-semibold text-gray-700 hover:bg-blue-100 transition duration-150"
                    onClick={() => setIsReminderSectionOpen(!isReminderSectionOpen)}
                >
                    {currentLanguage === 'en' ? 'Send Reminder' : 'یاد دہانی بھیجیں'}
                    {isReminderSectionOpen ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
                </button>
                {isReminderSectionOpen && (
                    <div className="p-4 border-t border-gray-200">
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
                    </div>
                )}
            </div>


            {/* Delete Student Button (Only shown in full view) */}
            {viewMode === 'full' && (
                <button
                    onClick={handleDeleteClick}
                    className="mt-6 w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition duration-300 ease-in-out text-lg tracking-wide transform hover:scale-105 active:scale-95"
                >
                    {currentLanguage === 'en' ? 'Delete Student' : 'طالب علم حذف کریں'}
                </button>
            )}

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
    currentLanguage: 'en' | 'ur';
}

const Dashboard: React.FC<DashboardProps> = ({ students, currentLanguage }) => {
    if (!students || students.length === 0) {
        return (
            <div className="mb-6 mx-auto w-full"> {/* Removed px-4 and max-w-xl */}
                <div className="bg-blue-50 p-6 rounded-xl shadow-inner text-center text-gray-600">
                    <BarChart2 className="w-12 h-12 mx-auto mb-4 text-blue-300" />
                    <p className="text-lg font-medium">{currentLanguage === 'en' ? 'No student data available for dashboard.' : 'ڈیش بورڈ کے لیے کوئی طالب علم ڈیٹا دستیاب نہیں ہے۔'}</p>
                </div>
            </div>
        );
    }

    const totalStudents = students.length;
    const pendingStudentsCount = students.filter(s => s.pending_amount && s.pending_amount > 0).length;
    const clearedStudentsCount = totalStudents - pendingStudentsCount;
    const totalPendingAmount = students.reduce((sum, student) => sum + (student.pending_amount || 0), 0);


    const pieData = [
        { name: currentLanguage === 'en' ? 'Cleared' : 'صاف شدہ', value: clearedStudentsCount },
        { name: currentLanguage === 'en' ? 'Pending' : 'زیر التواء', value: pendingStudentsCount },
    ];
    // Modern and interesting color palette
    const PIE_COLORS = ['#4CAF50', '#FFC107', '#2196F3', '#9C27B0'];


    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 mx-auto w-full border border-blue-50 flex flex-col items-center"> {/* Removed px-4 and max-w-2xl */}
            <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">{currentLanguage === 'en' ? 'Data Dashboard' : 'ڈیٹا ڈیش بورڈ'}</h2>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 w-full">
                <div className="bg-blue-50 p-5 rounded-xl shadow-md text-center border border-blue-100">
                    <p className="text-xl font-bold text-blue-700">{totalStudents}</p>
                    <p className="text-sm text-gray-600">{currentLanguage === 'en' ? 'Total Students' : 'کل طلباء'}</p>
                </div>
                <div className="bg-red-50 p-5 rounded-xl shadow-md text-center border border-red-100">
                    <p className="text-xl font-bold text-red-700">{pendingStudentsCount}</p>
                    <p className="text-sm text-gray-600">{currentLanguage === 'en' ? 'Pending Students' : 'زیر التواء طلباء'}</p>
                </div>
                <div className="bg-green-50 p-5 rounded-xl shadow-md text-center border border-green-100">
                    <p className="text-xl font-bold text-green-700">{clearedStudentsCount}</p>
                    <p className="text-sm text-gray-600">{currentLanguage === 'en' ? 'Cleared Students' : 'صاف شدہ طلباء'}</p>
                </div>
                <div className="bg-yellow-50 p-5 rounded-xl shadow-md text-center border border-yellow-100">
                    <p className="text-xl font-bold text-yellow-700">₹{totalPendingAmount.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">{currentLanguage === 'en' ? 'Total Pending' : 'کل زیر التواء'}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="space-y-8 w-full flex flex-col items-center">
                {/* Pending vs Cleared Pie Chart */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl shadow-md border border-purple-100 w-full">
                    <h3 className="text-lg font-bold mb-4 text-gray-800 text-center flex items-center justify-center">
                        <PieChart className="w-5 h-5 mr-2 text-purple-600" /> {currentLanguage === 'en' ? 'Fees Status' : 'فیس کی حیثیت'}
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <RechartsPieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => [`${value} ${currentLanguage === 'en' ? 'students' : 'طلباء'}`, name]} />
                            <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                        </RechartsPieChart>
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
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]); // To store IDs of selected students

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filteredStudents = allStudents?.filter(student => {
        // Filter by search term first
        const matchesSearch = searchTerm ? student.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
        if (!matchesSearch) return false;

        // Determine the actual next due date based on paid_till or admission_date
        const lastPaidDate = student.paid_till ? new Date(student.paid_till) : new Date(student.admission_date);
        lastPaidDate.setHours(0, 0, 0, 0);

        let nextPaymentDueDate = new Date(lastPaidDate);
        nextPaymentDueDate.setMonth(lastPaidDate.getMonth() + 1); // This will be the 1st day of the next month
        nextPaymentDueDate.setDate(1); // Ensure it's the 1st of the month after last paid/admitted.
        nextPaymentDueDate.setHours(0, 0, 0, 0); // Normalize time for comparison


        // If the student has pending fees (meaning their last paid date is in the past
        // relative to their monthly cycles), they should always show in 'all_pending'
        // and potentially in '1_week', '2_weeks', '1_month' if they are also coming due again.
        const isCurrentlyOverdue = (student.pending_amount && student.pending_amount > 0);

        // For advanced reminders, we consider the next *future* payment due date
        // relative to 'today'.
        // If the student is already overdue (isCurrentlyOverdue is true), they are always included.
        // Otherwise, check if their next payment *will be* due within the selected period.

        if (reminderPeriod === 'all_pending') {
            return isCurrentlyOverdue; // Only show students who actually have pending amounts.
        }

        const oneWeekFromNow = new Date(today);
        oneWeekFromNow.setDate(today.getDate() + 7);
        oneWeekFromNow.setHours(23, 59, 59, 999);

        const twoWeeksFromNow = new Date(today);
        twoWeeksFromNow.setDate(today.getDate() + 14);
        twoWeeksFromNow.setHours(23, 59, 59, 999);

        const oneMonthFromNow = new Date(today);
        oneMonthFromNow.setMonth(today.getMonth() + 1);
        oneMonthFromNow.setHours(23, 59, 59, 999);

        // Determine if their *next* payment is due within the selected window.
        // This includes overdue students (who satisfy `nextPaymentDueDate <= today` implicitly in their `pending_amount > 0`).
        // And for non-overdue students, it checks if `nextPaymentDueDate` falls between `today` and the end of the selected period.
        const isDueWithinWindow = nextPaymentDueDate >= today && nextPaymentDueDate <= (
            reminderPeriod === '1_week' ? oneWeekFromNow :
            reminderPeriod === '2_weeks' ? twoWeeksFromNow :
            oneMonthFromNow
        );

        return isCurrentlyOverdue || isDueWithinWindow;
    }) || [];

    const sortedReminderStudents = filteredStudents.sort((a, b) => {
        // Sort by how soon their next payment is due (or how long they've been pending)
        const dateA = a.paid_till ? new Date(a.paid_till).getTime() : new Date(a.admission_date).getTime();
        const dateB = b.paid_till ? new Date(b.paid_till).getTime() : new Date(b.admission_date).getTime();
        return dateA - dateB; // Earlier paid_till comes first (more overdue)
    });

    const handleCheckboxChange = (studentId: number, isChecked: boolean) => {
        setSelectedStudents(prevSelected =>
            isChecked ? [...prevSelected, studentId] : prevSelected.filter(id => id !== studentId)
        );
    };

    const handleSelectAll = (isChecked: boolean) => {
        if (isChecked) {
            setSelectedStudents(sortedReminderStudents.map(student => student.id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleSendReminder = (student: Student, type: 'whatsapp' | 'sms') => {
        if (!student.phone) {
            setError(currentLanguage === 'en' ? `No phone number available for ${student.name}. Cannot send reminder.` : `${student.name} کے لیے کوئی فون نمبر دستیاب نہیں ہے۔ یاد دہانی نہیں بھیجی جا سکتی۔`);
            setSuccessMessage(null);
            return;
        }

        const messageTemplate = currentLanguage === 'en'
            ? `Dear ${student.name}, this is a reminder regarding your pending fees of ₹${student.pending_amount} for ${student.pending_months} months. Last paid till: ${formatDate(student.paid_till)}. Please clear your dues. Thank you.`
            : `عزیز ${student.name}، یہ آپ کی زیر التواء فیس ₹${student.pending_amount} کے بارے میں ایک یاد دہانی ہے جو ${student.pending_months} مہینوں کے لیے باقی ہے۔ آخری ادائیگی کی تاریخ: ${formatDate(student.paid_till)}۔ براہ کرم اپنی واجبات صاف کریں۔ شکریہ۔`;

        const encodedMessage = encodeURIComponent(messageTemplate);

        if (type === 'whatsapp') {
            window.open(`https://wa.me/${student.phone}?text=${encodedMessage}`, '_blank');
            setSuccessMessage(currentLanguage === 'en' ? `WhatsApp reminder simulated for ${student.name}.` : `${student.name} کے لیے واٹس ایپ یاد دہانی بھیجی گئی۔`);
        } else { // SMS
            window.open(`sms:${student.phone}?body=${encodedMessage}`, '_blank');
            setSuccessMessage(currentLanguage === 'en' ? `SMS reminder simulated for ${student.name}.` : `${student.name} کے لیے ایس ایم ایس یاد دہانی بھیجی گئی۔`);
        }
    };

    const handleSendSelectedReminders = (type: 'whatsapp' | 'sms') => {
        if (selectedStudents.length === 0) {
            setError(currentLanguage === 'en' ? "No students selected for reminders." : "یاد دہانیوں کے لیے کوئی طالب علم منتخب نہیں کیا گیا۔");
            return;
        }

        const studentsToSend = sortedReminderStudents.filter(s => selectedStudents.includes(s.id));
        let successCount = 0;
        let failCount = 0;

        studentsToSend.forEach(student => {
            if (student.phone) {
                handleSendReminder(student, type); // This will open new tabs/windows
                successCount++;
            } else {
                failCount++;
            }
        });

        if (successCount > 0) {
            setSuccessMessage(currentLanguage === 'en' ? `Simulated sending ${successCount} ${type.toUpperCase()} reminders.` : `${successCount} ${type.toUpperCase()} یاد دہانیوں کو بھیجنے کی نقالی کی گئی۔`);
        }
        if (failCount > 0) {
            setError(currentLanguage === 'en' ? `${failCount} students could not receive reminders due to missing phone numbers.` : `${failCount} طلباء کو فون نمبر نہ ہونے کی وجہ سے یاد دہانیاں نہیں مل سکیں۔`);
        }
        setSelectedStudents([]); // Clear selection after sending
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 mx-auto w-full border border-blue-50"> {/* Removed max-w-xl */}
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
                <>
                    <div className="flex items-center mb-4">
                        <input
                            type="checkbox"
                            id="selectAll"
                            className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            checked={selectedStudents.length === sortedReminderStudents.length && sortedReminderStudents.length > 0}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                        <label htmlFor="selectAll" className="text-sm font-medium text-gray-700">
                            {currentLanguage === 'en' ? 'Select All' : 'تمام منتخب کریں'}
                        </label>
                        <span className="ml-auto text-sm text-gray-600">
                            {currentLanguage === 'en' ? 'Selected:' : 'منتخب کردہ:'} {selectedStudents.length}
                        </span>
                    </div>

                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => handleSendSelectedReminders('whatsapp')}
                            disabled={selectedStudents.length === 0}
                            className={`flex-1 flex items-center justify-center font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out text-base
                                ${selectedStudents.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white transform hover:scale-105 active:scale-95'}`}
                        >
                            <MessageSquare className="w-5 h-5 mr-2" /> {currentLanguage === 'en' ? 'WhatsApp Selected' : 'منتخب کردہ واٹس ایپ'}
                        </button>
                        <button
                            onClick={() => handleSendSelectedReminders('sms')}
                            disabled={selectedStudents.length === 0}
                            className={`flex-1 flex items-center justify-center font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out text-base
                                ${selectedStudents.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white transform hover:scale-105 active:scale-95'}`}
                        >
                            <MessageSquareText className="w-5 h-5 mr-2" /> {currentLanguage === 'en' ? 'SMS Selected' : 'منتخب کردہ ایس ایم ایس'}
                        </button>
                    </div>

                    <ul className="divide-y divide-gray-100">
                        {sortedReminderStudents.map(student => (
                            <li key={student.id} className="py-4 px-4 bg-orange-50/50 rounded-lg mb-3 shadow-sm border border-orange-100">
                                <div className="flex items-center mb-2">
                                    <input
                                        type="checkbox"
                                        className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        checked={selectedStudents.includes(student.id)}
                                        onChange={(e) => handleCheckboxChange(student.id, e.target.checked)}
                                    />
                                    <User className="w-5 h-5 mr-3 text-orange-600" />
                                    <p className="font-semibold text-lg text-gray-800">{student.name} (<span className="font-normal text-base">{currentLanguage === 'en' ? 'Roll No.:' : 'رول نمبر:'} {student.id}</span>)</p>
                                </div>
                                <div className="text-sm text-gray-700 space-y-1 ml-8">
                                    <p className="flex items-center"><CalendarDays className="w-4 h-4 mr-2 text-gray-500" />
                                        {currentLanguage === 'en' ? 'Last Paid Till:' : 'آخری ادائیگی:'} {formatDate(student.paid_till)}
                                    </p>
                                    <p className="flex items-center text-red-600 font-bold"><DollarSign className="w-4 h-4 mr-2" />
                                        {currentLanguage === 'en' ? 'Pending:' : 'باقی:'} ₹{student.pending_amount} ({student.pending_months} {currentLanguage === 'en' ? 'months' : 'مہینے'})
                                    </p>
                                    {student.phone && (
                                        <p className="flex items-center"><Phone className="w-4 h-4 mr-2 text-gray-500" />
                                            {currentLanguage === 'en' ? 'Phone:' : 'فون:'} <a href={`tel:${student.phone}`} className="text-blue-600 hover:underline">{student.phone}</a>
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
                </>
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
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 mx-auto w-full border border-blue-50"> {/* Removed max-w-md and px-4 */}
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
            setCurrentPage('settings');
        } catch (error) {
            // Error handled by handleChangePassword, which sets global error state
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 mx-auto w-full border border-blue-50"> {/* Removed max-w-xl and px-4 */}
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
    handleLogout: () => void; // Added handleLogout prop
}

const SettingsPage: React.FC<SettingsPageProps> = ({ setCurrentPage, currentLanguage, toggleLanguage, handleChangePassword, setError, setSuccessMessage, handleLogout }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 mx-auto w-full border border-blue-50"> {/* Removed max-w-xl and px-4 */}
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
            {/* Logout button moved here as per instructions */}
            <button
                onClick={handleLogout} // Call handleLogout here
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


// PendingStudentList.tsx (New component)
interface PendingStudentListProps {
    students: Student[] | null;
    title: string;
    onSelectStudent: (student: Student, viewMode: 'full' | 'pending-summary') => void;
    currentLanguage: 'en' | 'ur';
}

const PendingStudentList: React.FC<PendingStudentListProps> = ({ students, title, onSelectStudent, currentLanguage }) => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortBy, setSortBy] = useState<'amount' | 'longest_pending'>('amount'); // 'amount' for bigger amount, 'longest_pending' for pending from very long

    const filteredStudents = students?.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const sortedStudents = [...filteredStudents].sort((a, b) => {
        if (sortBy === 'amount') {
            return (b.pending_amount || 0) - (a.pending_amount || 0); // Descending for amount
        } else { // 'longest_pending'
            const dateA = a.paid_till ? new Date(a.paid_till).getTime() : new Date(a.admission_date).getTime();
            const dateB = b.paid_till ? new Date(b.paid_till).getTime() : new Date(b.admission_date).getTime();
            return dateA - dateB; // Ascending for date (older dates first)
        }
    });

    return (
        <div className="mb-6 mx-auto w-full"> {/* Removed px-4 and max-w-xl */}
            <h2 className="text-2xl font-bold mb-5 text-gray-800 text-center">{title}</h2>

            {/* Search Input - now its own card */}
            <div className="relative mb-4 bg-white p-6 rounded-2xl shadow-xl border border-blue-50">
                <input
                    type="text"
                    placeholder={currentLanguage === 'en' ? "Search students by name..." : "طالب علم کا نام تلاش کریں..."}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            {/* Sort Options (Segmented Button Style) */}
            <div className="flex justify-center bg-gray-100 rounded-xl p-1 mb-6 shadow-sm">
                <button
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition duration-200
                        ${sortBy === 'amount' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => setSortBy('amount')}
                >
                    {currentLanguage === 'en' ? 'Bigger Amount' : 'بڑی رقم'}
                </button>
                <button
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition duration-200
                        ${sortBy === 'longest_pending' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => setSortBy('longest_pending')}
                >
                    {currentLanguage === 'en' ? 'Longest Pending' : 'سب سے زیادہ زیر التواء'}
                </button>
            </div>


            {!students || students.length === 0 ? (
                <div className="bg-blue-50 p-6 rounded-xl shadow-inner text-center text-gray-600 mt-4">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-blue-300" />
                    <p className="text-lg font-medium">{currentLanguage === 'en' ? 'No students with pending fees found.' : 'زیر التواء فیس والے کوئی طالب علم نہیں ملے۔'}</p>
                </div>
            ) : filteredStudents.length === 0 ? (
                <div className="bg-blue-50 p-6 rounded-xl shadow-inner text-center text-gray-600 mt-4">
                    <Search className="w-12 h-12 mx-auto mb-4 text-blue-300" />
                    <p className="text-lg font-medium">{currentLanguage === 'en' ? 'No students match your search criteria.' : 'آپ کے تلاش کے معیار سے کوئی طالب علم نہیں ملا۔'}</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-blue-50 overflow-hidden"> {/* Removed max-h and overflow-y-auto */}
                    <ul className="divide-y divide-blue-50">
                        {sortedStudents.map(student => (
                            <li
                                key={student.id}
                                onClick={() => onSelectStudent(student, 'pending-summary')} // Navigate to 'pending-summary' view
                                className="py-4 px-3 flex items-center justify-between transition duration-200 ease-in-out hover:bg-blue-50 rounded-xl cursor-pointer -mx-3"
                            >
                                <div className="flex-1 min-w-0 flex items-center">
                                    <XCircle className="w-6 h-6 mr-3 text-red-500 flex-shrink-0 drop-shadow-sm" />
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-lg font-semibold text-gray-900 truncate">{student.name}</p>
                                        <p className="text-sm text-gray-500 flex items-center mt-1">
                                            <span className="font-normal mr-1">{currentLanguage === 'en' ? 'Roll No.:' : 'رول نمبر:'}</span> <span className="font-normal">{student.id}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right ml-4">
                                    <p className="text-lg font-bold text-red-500 flex items-center justify-end">
                                        ₹{student.pending_amount}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {currentLanguage === 'en' ? 'Paid Till:' : 'ادائیگی کی تاریخ تک:'} {formatDate(student.paid_till)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        ({student.pending_months} {currentLanguage === 'en' ? 'months pending' : 'مہینے زیر التواء'})
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
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

    // State for AddStudentForm data (lifted up for external button)
    const [addStudentFormData, setAddStudentFormData] = useState({
        name: '',
        address: null,
        phone: null,
        admission_date: '',
        initial_paid_till: '',
        monthly_fee: 400, // Default monthly fee
    });

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
                currentLanguage === 'en' ? "Password changed successfully!" : "پاس ورڈ کامیابی سے تبدیل ہو گیا ہے۔",
                currentLanguage === 'en' ? "Failed to change password. Please check old password." : "پاس ورڈ تبدیل کرنے میں ناکام۔ براہ کرم پرانا پاس ورڈ چیک کریں۔"
            );
            setCurrentPage('settings'); // Stay on settings or go back to main if preferred
        } catch (e) { /* Error handled by handleMutation */ }
    };


    const handleAddStudent = async () => {
        // Validation moved here from AddStudentForm
        if (!addStudentFormData.name || !addStudentFormData.admission_date || !addStudentFormData.initial_paid_till || addStudentFormData.monthly_fee === 0) {
            setError(currentLanguage === 'en' ? "Please fill in Name, Admission Date, Initial Paid Till date, and Monthly Fee." : "براہ کرم نام، داخلہ کی تاریخ، ابتدائی ادائیگی کی تاریخ تک، اور ماہانہ فیس پُر کریں۔");
            return;
        }
        if (new Date(addStudentFormData.initial_paid_till) < new Date(addStudentFormData.admission_date)) {
            setError(currentLanguage === 'en' ? "Initial Paid Till Date cannot be earlier than Admission Date." : "ابتدائی ادائیگی کی تاریخ داخلہ کی تاریخ سے پہلے نہیں ہو سکتی۔");
            return;
        }

        try {
            await handleMutation(
                `${API_BASE_URL}/students`,
                'POST',
                addStudentFormData,
                currentLanguage === 'en' ? "Student added successfully!" : "طالب علم کامیابی سے شامل کر دیا گیا!",
                currentLanguage === 'en' ? "Failed to add student." : "طالب علم شامل کرنے میں ناکام۔"
            );
            setCurrentPage('allStudents');
            fetchAllStudents();
            fetchPendingStudents();
            fetchAllPayments();
            // Reset form data after successful submission
            setAddStudentFormData({
                name: '',
                address: null,
                phone: null,
                admission_date: new Date().toISOString().split('T')[0],
                initial_paid_till: '',
                monthly_fee: 400,
            });
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

        // This variable helps decide the initial open/close state of sections in StudentDetail
        // and also which buttons/info to show.
        const studentDetailViewMode: 'full' | 'pending-summary' =
            (currentPage === 'allStudents' || currentPage === 'addStudent') ? 'full' : 'pending-summary';


        switch (currentPage) {
            case 'allStudents':
                return (
                    <StudentList
                        students={students}
                        title={currentLanguage === 'en' ? "All Students" : "تمام طلباء"}
                        onSelectStudent={(s) => {
                            setSelectedStudent(s);
                            setCurrentPage('studentDetail');
                            fetchStudentPayments(s.id);
                        }}
                        currentLanguage={currentLanguage}
                    />
                );
            case 'pendingStudents':
                return (
                    <PendingStudentList
                        students={pendingStudents}
                        title={currentLanguage === 'en' ? "Students with Pending Fees" : "زیر التواء فیس والے طلباء"}
                        onSelectStudent={(s) => {
                            setSelectedStudent(s);
                            setCurrentPage('studentDetail');
                            fetchStudentPayments(s.id);
                        }}
                        currentLanguage={currentLanguage}
                    />
                );
            case 'addStudent':
                return <AddStudentForm
                            studentData={addStudentFormData}
                            setStudentData={setAddStudentFormData}
                            setError={setError}
                            currentLanguage={currentLanguage}
                        />;
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
                return <Dashboard students={students} currentLanguage={currentLanguage} />;
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
                @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400..700&display=swap'); /* For Urdu font */
                body {
                    font-family: 'Inter', sans-serif;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    color: #333;
                    padding-top: 80px; /* Space for fixed header */
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

            <Header setCurrentPage={setCurrentPage} currentLanguage={currentLanguage} isLoggedIn={isLoggedIn} currentPage={currentPage} />

            <main className={`max-w-4xl mx-auto px-4 pt-4 ${currentLanguage === 'ur' ? 'lang-ur' : ''}`}>
                <MessageDisplay message={error} type="error" />
                <MessageDisplay message={successMessage} type="success" />
                {renderPage()}
            </main>

            {/* Fixed Add Student Button */}
            {currentPage === 'addStudent' && isLoggedIn && (
                <div className="fixed bottom-20 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm border-t border-gray-100 shadow-top-lg z-40">
                    <button
                        onClick={handleAddStudent}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition duration-300 ease-in-out text-lg tracking-wide transform hover:scale-105 active:scale-95"
                    >
                        {currentLanguage === 'en' ? 'Add Student' : 'طالب علم شامل کریں'}
                    </button>
                </div>
            )}

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
