// App.tsx (Main Application File)
import React, { useState, useEffect, useCallback } from 'react';
import {
    Home, Clock, UserPlus, Trash2, MessageCircle, MessageSquare, ChevronDown, ChevronUp, Power, KeyRound, BellRing, Settings, // Core navigation & action icons
    DollarSign, MapPin, Phone, CalendarDays, CheckCircle, XCircle,   // Detail/status icons
    BookOpen, GraduationCap, Search // Icons for student-related items
} from 'lucide-react'; // Ensure 'lucide-react' is installed via npm/yarn


// --- Type Definitions ---
interface Student {
    id: number;
    name: string;
    address: string | null;
    phone: string | null;
    admission_date: string; //YYYY-MM-DD
    admission_cancel_date: string | null; //YYYY-MM-DD
    monthly_fee: number;
    // These might be present if fetched from /students/pending or /students/:id/payments
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

// LoadingOverlay.tsx (New component for loading indicator)
interface LoadingOverlayProps {
    isLoading: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999] transition-opacity duration-300">
            <div className="flex flex-col items-center text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-lg">Loading...</p>
            </div>
        </div>
    );
};

// Header.tsx (Updated with Change Password and Logout buttons)
interface HeaderProps {
    isLoggedIn: boolean;
    setCurrentPage: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, setCurrentPage }) => {
    return (
        <header className="bg-gradient-to-r from-blue-700 to-indigo-900 text-white p-6 pb-8 rounded-b-3xl shadow-xl relative z-10 font-bold">
            <div className="flex justify-center items-center relative w-full"> {/* Flex container for title and buttons */}
                <h1 className="text-3xl sm:text-4xl font-extrabold text-center tracking-wide leading-tight flex-grow">
                    Student Fees Portal
                </h1>
                {isLoggedIn && (
                    <div className="absolute right-0 flex space-x-2 mr-2"> {/* Positioning buttons to the right */}
                        <button
                            onClick={() => setCurrentPage('settings')}
                            className="p-2 bg-blue-600 rounded-full hover:bg-blue-700 transition duration-200"
                            title="Settings"
                        >
                            <Settings className="w-5 h-5 text-white" />
                        </button>
                    </div>
                )}
            </div>
            <p className="text-center text-sm text-blue-200 mt-1 font-medium">Manage payments with ease</p>
        </header>
    );
};

// Navigation.tsx (Updated with Reminders Page)
interface NavigationProps {
    currentPage: string;
    setCurrentPage: (page: string) => void;
    fetchPendingStudents: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, setCurrentPage, fetchPendingStudents }) => {
    const navItems = [
        { name: 'All Students', icon: Home, page: 'allStudents' },
        { name: 'Pending', icon: Clock, page: 'pendingStudents', action: fetchPendingStudents },
        { name: 'Add', icon: UserPlus, page: 'addStudent' },
        { name: 'Reminders', icon: BellRing, page: 'reminders' }, // New Reminders page
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-top-lg border-t border-gray-100 z-50 p-2 sm:relative sm:bg-transparent sm:shadow-none sm:border-none sm:mb-8 flex justify-around sm:justify-center gap-2 sm:gap-4 sm:p-0">
            {navItems.map((item) => (
                <button
                    key={item.page}
                    onClick={() => {
                        setCurrentPage(item.page);
                        if (item.action) item.action();
                    }}
                    className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-all duration-200 ease-in-out
                        ${currentPage === item.page ? 'text-blue-700 font-semibold bg-blue-50/50' : 'text-gray-500 hover:text-blue-600'}`}
                >
                    <item.icon className="w-6 h-6 mb-1" />
                    <span className="text-xs sm:text-sm">{item.name}</span>
                </button>
            ))}
        </nav>
    );
};

// StudentList.tsx (Modified for horizontal card, less info, no 'fees clear', with search)
interface StudentListProps {
    students: Student[] | null;
    title: string;
    onSelectStudent: (student: Student, viewMode: 'full' | 'pending-summary') => void; // Added viewMode prop
}

const StudentList: React.FC<StudentListProps> = ({ students, title, onSelectStudent }) => {
    const [searchTerm, setSearchTerm] = useState<string>('');

    const filteredStudents = students?.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="bg-white p-4 rounded-2xl shadow-lg mb-6 mx-auto w-full max-w-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">{title}</h2>

            {/* Search Input */}
            <div className="relative mb-6">
                <input
                    type="text"
                    placeholder="Search students by name..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            {!students || students.length === 0 ? (
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center text-gray-600 mt-8">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No student records found.</p>
                </div>
            ) : filteredStudents.length === 0 ? (
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center text-gray-600 mt-8">
                    <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No students match your search criteria.</p>
                </div>
            ) : (
                <ul className="divide-y divide-gray-100">
                    {filteredStudents.map(student => (
                        <li
                            key={student.id}
                            onClick={() => onSelectStudent(student, 'full')} // Pass 'full' viewMode
                            className="py-3 px-4 flex items-center justify-between transition duration-200 ease-in-out hover:bg-blue-50 rounded-lg cursor-pointer -mx-2"
                        >
                            <div className="flex-1 min-w-0 flex items-center">
                                <GraduationCap className="w-6 h-6 mr-3 text-blue-600 flex-shrink-0" />
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-lg font-semibold text-gray-900 truncate">{student.name}</p>
                                    <p className="text-sm text-gray-500 flex items-center mt-1">
                                        <MapPin className="w-4 h-4 mr-1 text-gray-400 flex-shrink-0" />
                                        {student.address ? student.address.split(',')[0].trim() : 'N/A'} {/* Short address */}
                                    </p>
                                    <p className="text-sm text-gray-500 flex items-center mt-1">
                                        <span className="font-semibold mr-1">ID:</span> {student.id}
                                    </p>
                                    <p className="text-sm text-gray-500 flex items-center mt-1">
                                        <CalendarDays className="w-4 h-4 mr-1 text-gray-400 flex-shrink-0" />
                                        Adm: {student.admission_date ? new Date(student.admission_date).toLocaleDateString() : 'N/A'}
                                    </p>
                                    {/* Removed Paid Till and Fees Clear from this overview page */}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// AddStudentForm.tsx (Added admission_date and initial_paid_till)
interface AddStudentFormProps {
    handleAddStudent: (studentData: {
        name: string;
        address: string | null;
        phone: string | null;
        admission_date: string; // New field
        initial_paid_till: string; // New field, renamed from paid_till
        monthly_fee: number;
    }) => Promise<void>;
    setError: (message: string | null) => void;
}

const AddStudentForm: React.FC<AddStudentFormProps> = ({ handleAddStudent, setError }) => {
    const [name, setName] = useState<string>('');
    const [address, setAddress] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [admissionDate, setAdmissionDate] = useState<string>(''); // State for admission date
    const [initialPaidTill, setInitialPaidTill] = useState<string>(''); // State for initial paid till date
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
        <div className="bg-white p-4 rounded-2xl shadow-lg mb-6 mx-auto w-full max-w-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">Add New Student</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Student Name</label>
                    <input
                        type="text"
                        id="name"
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
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
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
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
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
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
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
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
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
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
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={initialPaidTill}
                        onChange={(e) => setInitialPaidTill(e.target.value)}
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out text-lg tracking-wide transform hover:scale-105 active:scale-95"
                >
                    Add Student
                </button>
            </form>
        </div>
    );
};

// StudentDetail.tsx (Sectioned, Collapsible, Delete Option, Improved Reminders)
interface StudentDetailProps {
    student: Student;
    payments: Payment[];
    onUpdatePayment: (studentId: number, paidTillDate: string) => Promise<void>;
    onBackToList: () => void;
    handleDeleteStudent: (studentId: number, studentName: string, passwordConfirmation: string) => Promise<void>; // Added passwordConfirmation
    setError: (message: string | null) => void;
    setSuccessMessage: (message: string | null) => void; // Passed down from App.tsx
    pendingDataForStudent: {
        pending_months: number;
        pending_amount: number;
        paid_till: string | null;
    };
    // Removed allStudents as it was unused in this component's props.
    viewMode: 'full' | 'pending-summary'; // New prop to control display mode
}

const StudentDetail: React.FC<StudentDetailProps> = ({ student, payments, onUpdatePayment, onBackToList, handleDeleteStudent, setError, setSuccessMessage, pendingDataForStudent, viewMode }) => {
    const [newPaidTill, setNewPaidTill] = useState<string>('');
    const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false); // State for confirmation dialog
    const [deletePassword, setDeletePassword] = useState<string>(''); // State for delete password input
    
    // State for collapsible sections - initially collapsed if not in pending-summary mode
    const [isBiodataOpen, setIsBiodataOpen] = useState(viewMode === 'full'); // Open by default in full view
    const [isPaymentInfoOpen, setIsPaymentInfoOpen] = useState(viewMode === 'full'); // Open by default in full view
    const [isRemindersOpen, setIsRemindersOpen] = useState(viewMode === 'full'); // Open by default in full view


    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPaidTill) {
            setError("Please select a date to update.");
            return;
        }
        await onUpdatePayment(student.id, newPaidTill);
        setNewPaidTill('');
    };

    // Removed getSiblingsPendingInfo as it's no longer directly used in this component's reminder logic

    const generateCombinedMessage = (sendType: 'whatsapp' | 'sms', studentsToSend: Student[]) => {
        if (studentsToSend.length === 0) {
            setError("No students selected to send message.");
            return;
        }

        let message = `Dear Parent/Guardian,\n\n`;

        studentsToSend.forEach((s, index) => {
            // Determine reminder context for each student
            const today = new Date();
            const latestPaidTillDate = s.paid_till ? new Date(s.paid_till) : null;
            let reminderContext = '';

            if (s.pending_amount && s.pending_amount > 0) {
                reminderContext = "Your fees are overdue.";
            } 
            // Condition for "due soon" (within 10 days of next payment)
            else if (latestPaidTillDate) {
                const paidTillEndOfMonth = new Date(latestPaidTillDate.getFullYear(), latestPaidTillDate.getMonth() + 1, 0); // Last day of paid_till month
                const daysUntilNextDue = Math.ceil((paidTillEndOfMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                if (daysUntilNextDue <= 10 && daysUntilNextDue >= 0) { // If next payment due within 10 days
                    reminderContext = "Your fees for the upcoming month will be due soon.";
                } else if (latestPaidTillDate.getTime() < today.getTime() && (s.pending_amount === 0 || s.pending_amount === undefined)) {
                     reminderContext = "A payment reminder regarding your ward's fees."; // Fallback for edge cases
                } else {
                    reminderContext = "Your fees are currently paid in advance.";
                }
            } else {
                // No payments recorded, consider from admission date for initial reminders
                const admissionDate = new Date(s.admission_date);
                if (admissionDate.getTime() < today.getTime() && (s.pending_amount === 0 || s.pending_amount === undefined)) {
                    reminderContext = "A payment reminder regarding your ward's fees.";
                } else {
                    reminderContext = "Welcome! This is an initial fee reminder.";
                }
            }


            message += `*Student ${index + 1}:* ${s.name}\n`;
            message += `  ${reminderContext}\n`;
            if (s.monthly_fee) message += `  Monthly Fee: ₹${s.monthly_fee}\n`;
            if (s.pending_amount !== undefined && s.pending_amount > 0) {
                message += `  *Pending:* ₹${s.pending_amount} (${s.pending_months} months)\n`;
            }
            message += `  Last Paid Till: ${s.paid_till ? new Date(s.paid_till).toLocaleDateString() : 'N/A'}\n`;
            if (index < studentsToSend.length - 1) {
                message += `\n`; // Add a blank line between students for readability
            }
        });

        message += `\nPlease clear the outstanding fees at your earliest convenience. Thank you.`;

        // Assuming a single phone number for all related students if sending from StudentDetail
        const targetPhone = studentsToSend[0].phone; 
        if (!targetPhone) {
            setError("No phone number available for the selected students.");
            return;
        }

        try {
            if (sendType === 'whatsapp') {
                const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
            } else if (sendType === 'sms') {
                const smsUrl = `sms:${targetPhone}?body=${encodeURIComponent(message)}`;
                window.open(smsUrl, '_blank');
            }
            setSuccessMessage(`Reminder message initiated for ${student.name}.`);
        } catch (e) {
            setError("Failed to open messaging app. Ensure phone number is valid and app is installed.");
            console.error("Messaging error:", e);
        }
    };


    const confirmAndDelete = () => {
        if (!deletePassword) {
            setError("Please enter password to confirm deletion.");
            return;
        }
        handleDeleteStudent(student.id, student.name, deletePassword);
        setShowConfirmDelete(false);
        setDeletePassword(''); // Clear password field
    };

    return (
        <div className="bg-white p-4 rounded-2xl shadow-lg mb-6 mx-auto w-full max-w-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">Student Details: {student.name}</h2>
            <p className="text-sm text-gray-500 text-center mb-6">Student ID: {student.id}</p>

            {/* Student Biodata Section (Only in 'full' viewMode) */}
            {viewMode === 'full' && (
                <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
                    <button 
                        className="w-full flex justify-between items-center bg-gray-50 p-4 font-semibold text-gray-700 hover:bg-gray-100 transition duration-150"
                        onClick={() => setIsBiodataOpen(!isBiodataOpen)}
                    >
                        Student Biodata
                        {isBiodataOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    {isBiodataOpen && (
                        <div className="p-4 space-y-2 text-gray-700 text-base border-t border-gray-200">
                            <p className="flex items-center"><MapPin className="w-5 h-5 mr-3 text-gray-500" /><span className="font-semibold">Address:</span> {student.address || 'N/A'}</p>
                            <p className="flex items-center"><Phone className="w-5 h-5 mr-3 text-gray-500" /><span className="font-semibold">Phone:</span> {student.phone || 'N/A'}</p>
                            <p className="flex items-center"><CalendarDays className="w-5 h-5 mr-3 text-gray-500" /><span className="font-semibold">Admission Date:</span> {student.admission_date ? new Date(student.admission_date).toLocaleDateString() : 'N/A'}</p>
                            <p className="flex items-center"><DollarSign className="w-5 h-5 mr-3 text-gray-500" /><span className="font-semibold">Monthly Fee:</span> ₹{student.monthly_fee}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Student Payment Information Section (Always shown, but content varies based on viewMode) */}
            <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
                <button 
                    className="w-full flex justify-between items-center bg-gray-50 p-4 font-semibold text-gray-700 hover:bg-gray-100 transition duration-150"
                    onClick={() => setIsPaymentInfoOpen(!isPaymentInfoOpen)}
                >
                    Student Payment Information
                    {isPaymentInfoOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {isPaymentInfoOpen && (
                    <div className="p-4 border-t border-gray-200">
                        {pendingDataForStudent && (
                            <div className="mb-6 space-y-2 text-gray-700 text-base">
                                <p className="text-red-600 font-bold text-lg flex items-center mt-2"><XCircle className="w-6 h-6 mr-3" /><span className="font-semibold">Current Pending:</span> ₹{pendingDataForStudent.pending_amount} ({pendingDataForStudent.pending_months} months)</p>
                                <p className="text-sm text-gray-500 flex items-center pl-9"><CheckCircle className="w-4 h-4 mr-2 text-green-500" />Last Paid Till: {pendingDataForStudent.paid_till ? new Date(pendingDataForStudent.paid_till).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        )}

                        {viewMode === 'full' && ( /* Only show full history in 'full' view */
                            <>
                                <h3 className="text-lg font-bold mb-3 text-gray-800 border-b-2 border-gray-100 pb-2 flex items-center">
                                    <BookOpen className="w-6 h-6 mr-3 text-gray-600" />Payment History
                                </h3>
                                {payments && payments.length === 0 ? (
                                    <p className="text-gray-600 py-4 text-center">No payment records found for this student.</p>
                                ) : (
                                    <ul className="divide-y divide-gray-100 mb-6">
                                        {payments && payments.map(payment => (
                                            <li key={payment.id} className="py-2 text-gray-700 text-base flex items-center">
                                                <CheckCircle className="w-5 h-5 mr-3 text-green-500" />Paid Till: {payment.paid_till ? new Date(payment.paid_till).toLocaleDateString() : 'N/A'}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        )}

                        <h3 className="text-lg font-bold mb-3 text-gray-800 border-b-2 border-gray-100 pb-2 flex items-center">
                            <DollarSign className="w-6 h-6 mr-3 text-gray-600" />Update Payment
                        </h3>
                        <form onSubmit={handleUpdateSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="newPaidTill" className="block text-sm font-medium text-gray-700">New Paid Till Date</label>
                                <input
                                    type="date"
                                    id="newPaidTill"
                                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                                    value={newPaidTill}
                                    onChange={(e) => setNewPaidTill(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out text-lg tracking-wide transform hover:scale-105 active:scale-95"
                            >
                                Update Payment
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Send Payment Reminder Section (Always shown) */}
            <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
                <button 
                    className="w-full flex justify-between items-center bg-gray-50 p-4 font-semibold text-gray-700 hover:bg-gray-100 transition duration-150"
                    onClick={() => setIsRemindersOpen(!isRemindersOpen)}
                >
                    Send Payment Reminder
                    {isRemindersOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {isRemindersOpen && (
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => generateCombinedMessage('whatsapp', [student])} // Send only this student
                                className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out text-lg flex items-center justify-center transform hover:scale-105 active:scale-95"
                            >
                                <MessageCircle className="w-5 h-5 mr-2" />
                                WhatsApp
                            </button>
                            <button
                                onClick={() => generateCombinedMessage('sms', [student])} // Send only this student
                                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out text-lg flex items-center justify-center transform hover:scale-105 active:scale-95"
                            >
                                <MessageSquare className="w-5 h-5 mr-2" />
                                SMS
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Student Button (Only in 'full' viewMode) */}
            {viewMode === 'full' && (
                <button
                    onClick={() => setShowConfirmDelete(true)}
                    className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out text-lg tracking-wide transform hover:scale-105 active:scale-95 flex items-center justify-center"
                >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Delete Student
                </button>
            )}

            {/* Back Button (Always shown) */}
            <button
                onClick={onBackToList}
                className="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out text-lg tracking-wide transform hover:scale-105 active:scale-95"
            >
                Back to All Students
            </button>

            {/* Confirmation Modal */}
            {showConfirmDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Confirm Deletion</h3>
                        <p className="text-gray-700 mb-4">Are you sure you want to delete <span className="font-semibold">{student.name}</span>? This action cannot be undone.</p>
                        <div className="mb-4">
                            <label htmlFor="delete-password" className="block text-sm font-medium text-gray-700 mb-1">Enter Admin Password to Confirm</label>
                            <input
                                type="password"
                                id="delete-password"
                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-red-500 focus:border-red-500 transition duration-150 ease-in-out"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => { setShowConfirmDelete(false); setDeletePassword(''); }} // Clear password on cancel
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAndDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// AuthForm.tsx (New component for login)
interface AuthFormProps {
    API_BASE_URL: string;
    setIsLoggedIn: (loggedIn: boolean) => void;
    setError: (message: string | null) => void;
    setSuccessMessage: (message: string | null) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ API_BASE_URL, setIsLoggedIn, setError, setSuccessMessage }) => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loadingAuth, setLoadingAuth] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingAuth(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData: ErrorResponse = await response.json();
                throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
            }

            setSuccessMessage("Login successful!");
            setIsLoggedIn(true); // Set login state on success
        } catch (e: any) {
            console.error("Login failed:", e);
            setError(`Login failed: ${e.message}`);
        } finally {
            setLoadingAuth(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-3xl shadow-xl mb-6 mx-auto w-full max-w-sm mt-10">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">Admin Login</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="auth-username" className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                    <input
                        type="text"
                        id="auth-username"
                        className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="admin"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="auth-password" className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                    <input
                        type="password"
                        id="auth-password"
                        className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="password"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out text-lg tracking-wide transform hover:scale-105 active:scale-95"
                    disabled={loadingAuth}
                >
                    {loadingAuth ? 'Logging In...' : 'Login'}
                </button>
            </form>
            <div className="mt-6 text-center text-gray-500 text-sm">
                (Default: Username: `admin`, Password: `password`)
            </div>
        </div>
    );
};

// ChangePasswordForm.tsx (New component for changing password)
interface ChangePasswordFormProps {
    API_BASE_URL: string;
    setError: (message: string | null) => void;
    setSuccessMessage: (message: string | null) => void;
    onPasswordChangeSuccess: () => void;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ API_BASE_URL, setError, setSuccessMessage, onPasswordChangeSuccess }) => {
    const [oldPassword, setOldPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
    const [loadingChange, setLoadingChange] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingChange(true);
        setError(null);
        setSuccessMessage(null);

        if (newPassword !== confirmNewPassword) {
            setError("New password and confirm new password do not match.");
            setLoadingChange(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/change_password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
            });

            if (!response.ok) {
                const errorData: ErrorResponse = await response.json();
                throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
            }

            setSuccessMessage("Password changed successfully!");
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            onPasswordChangeSuccess(); // Navigate back or refresh
        } catch (e: any) {
            console.error("Password change failed:", e);
            setError(`Password change failed: ${e.message}`);
        } finally {
            setLoadingChange(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-3xl shadow-xl mb-6 mx-auto w-full max-w-sm mt-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Change Admin Password</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="old-password" className="block text-sm font-semibold text-gray-700 mb-1">Old Password</label>
                    <input
                        type="password"
                        id="old-password"
                        className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="new-password" className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                    <input
                        type="password"
                        id="new-password"
                        className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="confirm-new-password" className="block text-sm font-semibold text-gray-700 mb-1">Confirm New Password</label>
                    <input
                        type="password"
                        id="confirm-new-password"
                        className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out text-lg tracking-wide transform hover:scale-105 active:scale-95"
                    disabled={loadingChange}
                >
                    {loadingChange ? 'Changing...' : 'Change Password'}
                </button>
            </form>
            <button
                type="button"
                onClick={onPasswordChangeSuccess} // Use this to go back
                className="w-full mt-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out text-lg tracking-wide transform hover:scale-105 active:scale-95"
            >
                Back to Settings
            </button>
        </div>
    );
};

// SettingsPage.tsx (New component to house settings options)
interface SettingsPageProps {
    API_BASE_URL: string;
    setError: (message: string | null) => void;
    setSuccessMessage: (message: string | null) => void;
    setCurrentPage: (page: string) => void;
    handleLogout: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ API_BASE_URL, setError, setSuccessMessage, setCurrentPage, handleLogout }) => {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-lg mb-6 mx-auto w-full max-w-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">Settings</h2>
            <div className="space-y-4">
                <button
                    onClick={() => setCurrentPage('changePassword')}
                    className="w-full flex items-center justify-center p-4 bg-blue-100 text-blue-800 rounded-lg shadow-sm hover:bg-blue-200 transition duration-150 font-semibold"
                >
                    <KeyRound className="w-5 h-5 mr-2" /> Change Admin Password
                </button>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center p-4 bg-red-100 text-red-800 rounded-lg shadow-sm hover:bg-red-200 transition duration-150 font-semibold"
                >
                    <Power className="w-5 h-5 mr-2" /> Logout
                </button>
                {/* Future Language Selection Placeholder */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
                    <p className="font-semibold mb-2">Language Settings (Future Feature)</p>
                    <p className="text-sm">This section will allow you to select your preferred application language, including Urdu.</p>
                </div>
            </div>
            <button
                onClick={() => setCurrentPage('allStudents')}
                className="mt-6 w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out text-lg tracking-wide transform hover:scale-105 active:scale-95"
            >
                Back to Main
            </button>
        </div>
    );
};

// ReminderList.tsx (New component for bulk reminders)
interface ReminderListProps {
    allStudents: Student[] | null;
    setError: (message: string | null) => void;
    setSuccessMessage: (message: string | null) => void;
}

const ReminderList: React.FC<ReminderListProps> = ({ allStudents, setError, setSuccessMessage }) => {
    const [studentsForReminders, setStudentsForReminders] = useState<Student[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]); // Store IDs of selected students
    const [filterDaysAhead, setFilterDaysAhead] = useState<number>(10); // Default 10 days ahead for reminders


    const filterAndPrepareReminders = useCallback(() => {
        if (!allStudents) return;

        const today = new Date();
        // Set time to 00:00:00 to avoid time-of-day issues in comparison
        today.setHours(0, 0, 0, 0); 
        const reminderThreshold = new Date(today);
        reminderThreshold.setDate(today.getDate() + filterDaysAhead); // e.g., 10 days from now
        reminderThreshold.setHours(23, 59, 59, 999); // Set to end of the threshold day

        const studentsToRemind: Student[] = [];
        const processedParentsPhones = new Set<string>(); // To handle unique parents by phone number


        allStudents.forEach(student => {
            // Ensure student has a phone number before considering for reminders
            if (!student.phone) return; 

            const latestPaidTillDate = student.paid_till ? new Date(student.paid_till) : null;
            let shouldInclude = false;

            // Condition 1: Student has pending fees (overdue)
            if (student.pending_amount && student.pending_amount > 0) {
                shouldInclude = true;
            } 
            // Condition 2: Student's paid_till date means fees are due soon or just passed
            else if (latestPaidTillDate) {
                // Determine the end of the month the student is paid till
                const paidTillEndOfMonth = new Date(latestPaidTillDate.getFullYear(), latestPaidTillDate.getMonth() + 1, 0);
                paidTillEndOfMonth.setHours(23, 59, 59, 999); // Set to end of day for comparison

                // If paid till date is in the past (before today's start), but not yet marked pending by backend,
                // or if it's the current month and approaching due
                if (paidTillEndOfMonth.getTime() < today.getTime()) {
                    // Paid till is in a past month (e.g., paid till June 30, and it's July)
                    // If backend hasn't marked pending yet, this is overdue.
                    shouldInclude = true;
                } else if (paidTillEndOfMonth.getTime() <= reminderThreshold.getTime()) {
                    // Paid till is current or future month, but within the reminder threshold.
                    // This covers "due soon" scenarios.
                    shouldInclude = true;
                }
            } else {
                // Condition 3: No payments recorded, consider from admission date
                const admissionDate = new Date(student.admission_date);
                admissionDate.setHours(0, 0, 0, 0);
                // If admission date is in the past or within the reminder threshold
                if (admissionDate.getTime() <= reminderThreshold.getTime()) {
                    shouldInclude = true;
                }
            }
            
            // Only add if student meets criteria and their parent's phone hasn't been added yet
            if (shouldInclude && !processedParentsPhones.has(student.phone)) {
                studentsToRemind.push(student);
                processedParentsPhones.add(student.phone);
            }
        });
        
        // Sort students for consistent display (e.g., by name)
        studentsToRemind.sort((a, b) => a.name.localeCompare(b.name));

        setStudentsForReminders(studentsToRemind);
        setSelectedStudents([]); // Reset selections when filters change
    }, [allStudents, filterDaysAhead]);


    useEffect(() => {
        filterAndPrepareReminders();
    }, [filterAndPrepareReminders]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedStudents(studentsForReminders.map(s => s.id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleSelectStudent = (studentId: number) => {
        setSelectedStudents(prev => 
            prev.includes(studentId) 
                ? prev.filter(id => id !== studentId) 
                : [...prev, studentId]
        );
    };

    // Generic message generation for selected students (grouped by phone)
    const generateBulkMessage = (sendType: 'whatsapp' | 'sms') => {
        if (selectedStudents.length === 0) {
            setError("Please select at least one student to send a reminder.");
            return;
        }

        const selectedStudentsData = allStudents?.filter(s => selectedStudents.includes(s.id)) || [];
        if (selectedStudentsData.length === 0) {
            setError("No student data found for selected students.");
            return;
        }

        // Group students by phone number to send one message per unique parent
        const studentsByPhone: { [phone: string]: Student[] } = {};
        selectedStudentsData.forEach(student => {
            if (student.phone) {
                if (!studentsByPhone[student.phone]) {
                    studentsByPhone[student.phone] = [];
                }
                studentsByPhone[student.phone].push(student);
            }
        });

        if (Object.keys(studentsByPhone).length === 0) {
            setError("No valid phone numbers for selected students.");
            return;
        }

        Object.keys(studentsByPhone).forEach(phone => {
            const studentsForThisPhone = studentsByPhone[phone];
            let message = `Dear Parent/Guardian,\n\n`;
            
            // Generate message content for each student associated with this phone number
            studentsForThisPhone.forEach((s, index) => {
                const today = new Date();
                const latestPaidTillDate = s.paid_till ? new Date(s.paid_till) : null;
                let reminderContext = '';

                if (s.pending_amount && s.pending_amount > 0) {
                    reminderContext = "Your fees are overdue.";
                } else if (latestPaidTillDate) {
                    const paidTillEndOfMonth = new Date(latestPaidTillDate.getFullYear(), latestPaidTillDate.getMonth() + 1, 0); // Last day of paid_till month
                    paidTillEndOfMonth.setHours(23, 59, 59, 999);
                    const daysUntilNextDue = Math.ceil((paidTillEndOfMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    
                    if (daysUntilNextDue <= 10 && daysUntilNextDue >= 0) {
                        reminderContext = "Your fees for the upcoming month will be due soon.";
                    } else if (latestPaidTillDate.getTime() < today.getTime() && (s.pending_amount === 0 || s.pending_amount === undefined)) {
                         reminderContext = "A payment reminder regarding your ward's fees.";
                    } else {
                        reminderContext = "Your fees are currently paid in advance.";
                    }
                } else {
                    const admissionDate = new Date(s.admission_date);
                    if (admissionDate.getTime() < today.getTime() && (s.pending_amount === 0 || s.pending_amount === undefined)) {
                        reminderContext = "A payment reminder regarding your ward's fees.";
                    } else {
                        reminderContext = "Welcome! This is an initial fee reminder.";
                    }
                }

                message += `*Student ${index + 1}:* ${s.name}\n`;
                message += `  ${reminderContext}\n`;
                if (s.monthly_fee) message += `  Monthly Fee: ₹${s.monthly_fee}\n`;
                if (s.pending_amount !== undefined && s.pending_amount > 0) {
                    message += `  *Pending:* ₹${s.pending_amount} (${s.pending_months} months)\n`;
                }
                message += `  Last Paid Till: ${s.paid_till ? new Date(s.paid_till).toLocaleDateString() : 'N/A'}\n`;
                if (index < studentsForThisPhone.length - 1) {
                    message += `\n`;
                }
            });
            message += `\nPlease clear the outstanding fees at your earliest convenience. Thank you.`;

            // Open tab/app for WhatsApp/SMS
            try {
                if (sendType === 'whatsapp') {
                    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                } else if (sendType === 'sms') {
                    const smsUrl = `sms:${phone}?body=${encodeURIComponent(message)}`;
                    window.open(smsUrl, '_blank');
                }
            } catch (e) {
                setError(`Failed to open messaging app for ${phone}.`);
                console.error("Bulk messaging error:", e);
            }
        });
        setSuccessMessage(`Reminder messages initiated for ${Object.keys(studentsByPhone).length} unique parents.`);
    };


    return (
        <div className="bg-white p-4 rounded-2xl shadow-lg mb-6 mx-auto w-full max-w-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">Fee Reminders</h2>
            
            {/* Filter by Days Ahead (Horizontal Layout) */}
            <div className="flex items-center space-x-3 mb-4">
                <label htmlFor="filterDaysAhead" className="text-sm font-medium text-gray-700 flex-shrink-0">
                    Due in (days):
                </label>
                <input
                    type="number"
                    id="filterDaysAhead"
                    className="flex-grow border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                    value={filterDaysAhead}
                    onChange={(e) => setFilterDaysAhead(parseInt(e.target.value) || 0)}
                    min="0"
                />
                 <button
                    onClick={filterAndPrepareReminders}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out text-sm flex-shrink-0"
                >
                    Apply
                </button>
            </div>
           

            {studentsForReminders.length === 0 ? (
                <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-600">
                    <BellRing className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No students currently require reminders based on the filter.</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center mb-4 border-b pb-2 border-gray-100">
                        <input
                            type="checkbox"
                            id="selectAllReminders"
                            checked={selectedStudents.length === studentsForReminders.length && studentsForReminders.length > 0}
                            onChange={handleSelectAll}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="selectAllReminders" className="font-semibold text-gray-800">Select All ({selectedStudents.length}/{studentsForReminders.length})</label>
                    </div>
                    <ul className="divide-y divide-gray-100 mb-6 max-h-96 overflow-y-auto border border-gray-200 rounded-lg"> {/* Added border and rounded for list */}
                        {studentsForReminders.map(student => (
                            <li key={student.id} className="py-3 flex items-start gap-3 bg-white px-4 rounded-lg hover:bg-blue-50 transition duration-150 ease-in-out">
                                <input
                                    type="checkbox"
                                    checked={selectedStudents.includes(student.id)}
                                    onChange={() => handleSelectStudent(student.id)}
                                    className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <div className="flex-1">
                                    <p className="text-lg font-semibold text-gray-900">{student.name} (ID: {student.id})</p>
                                    <p className="text-sm text-gray-700 flex items-center"><Phone className="w-4 h-4 mr-1 text-gray-500" /> {student.phone || 'N/A'}</p>
                                    <p className="text-sm text-gray-500 flex items-center"><CheckCircle className="w-4 h-4 mr-1 text-green-500" /> Paid Till: {student.paid_till ? new Date(student.paid_till).toLocaleDateString() : 'N/A'}</p>
                                    {student.pending_amount !== undefined && student.pending_amount > 0 && (
                                        <p className="text-sm text-red-600 font-bold flex items-center"><DollarSign className="w-4 h-4 mr-1 text-red-500" /> Pending: ₹{student.pending_amount} ({student.pending_months} months)</p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        <button
                            onClick={() => generateBulkMessage('whatsapp')} // Bulk send WhatsApp
                            className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out text-lg flex items-center justify-center transform hover:scale-105 active:scale-95"
                            disabled={selectedStudents.length === 0}
                        >
                            <MessageCircle className="w-5 h-5 mr-2" />
                            WhatsApp Selected
                        </button>
                        <button
                            onClick={() => generateBulkMessage('sms')} // Bulk send SMS
                            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out text-lg flex items-center justify-center transform hover:scale-105 active:scale-95"
                            disabled={selectedStudents.length === 0}
                        >
                            <MessageSquare className="w-5 h-5 mr-2" />
                            SMS Selected
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};


// --- App.tsx (Main Application Logic) ---
const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<string>('allStudents');
    const [students, setStudents] = useState<Student[] | null>(null);
    const [pendingStudents, setPendingStudents] = useState<Student[] | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [studentPayments, setStudentPayments] = useState<StudentPaymentDetailsResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false); // Global loading state
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); // Authentication state

    // Base URL for the Flask API
    // IMPORTANT: If running on a physical mobile device, replace '192.168.1.6' with your computer's local IP address
    // (e.g., 'http://192.168.1.5:5000').
    // Also, ensure your Flask backend has Flask-CORS installed and configured to allow requests from your frontend's origin.
    const API_BASE_URL = 'http://192.168.1.6:5000';

    // Message display component
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
            <div className={`${bgColor} ${textColor} border ${borderColor} rounded-md p-4 mb-4 text-center mx-auto max-w-xl font-medium text-sm`}>
                {message}
            </div>
        );
    };

    // Data fetching functions (updated to return Promise<T | null>)
    const fetchData = useCallback(async <T,>(
        url: string,
        errorMessage: string
    ): Promise<T | null> => { // Changed return type to Promise<T | null>
        setLoading(true); // Start loading
        setError(null);
        setSuccessMessage(null);
        try {
            const response = await fetch(url); // No headers needed for unauthenticated API
            
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
            return data; // Return data directly
        } catch (e: any) {
            console.error(errorMessage, e);
            setError(`${errorMessage} Please ensure the Flask backend is running on ${API_BASE_URL} and CORS is configured. Error: ${e.message}`);
            return null; // Return null on error
        } finally {
            setLoading(false); // End loading
        }
    }, [API_BASE_URL, setError, setSuccessMessage]); // Include setError and setSuccessMessage in dependencies


    // Updated data fetchers to await fetchData and set state
    const fetchAllStudents = useCallback(async () => {
        const data = await fetchData<Student[]>(`${API_BASE_URL}/students`, "Failed to load students.");
        setStudents(data);
    }, [fetchData, API_BASE_URL]);

    const fetchPendingStudents = useCallback(async () => {
        const data = await fetchData<Student[]>(`${API_BASE_URL}/students/pending`, "Failed to load pending students.");
        setPendingStudents(data);
    }, [fetchData, API_BASE_URL]);

    const fetchStudentPayments = useCallback(async (studentId: number) => {
        const fetchedData = await fetchData<StudentPaymentDetailsResponse>(`${API_BASE_URL}/students/${studentId}/payments`, "Failed to load payment details.");
        if (fetchedData) { // Explicitly check if data is not null
            setSelectedStudent(fetchedData.student);
            setStudentPayments(fetchedData);
        } else {
            setSelectedStudent(null);
            setStudentPayments(null);
        }
    }, [fetchData, API_BASE_URL]);


    // Mutation functions (updated to use global loading state)
    const handleMutation = useCallback(async (url: string, method: string, body: any, successMsg: string, errorMsg: string) => {
        setLoading(true); // Start loading
        setError(null);
        setSuccessMessage(null);
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: body ? JSON.stringify(body) : null, // Handle no body for DELETE
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
            setLoading(false); // End loading
        }
    }, [setError, setSuccessMessage]); // Include setError and setSuccessMessage in dependencies

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
                "Student added successfully!",
                "Failed to add student."
            );
            setCurrentPage('allStudents');
            fetchAllStudents();
        }
        // No explicit catch here, error handled by handleMutation
        catch (e) {} 
    };

    const handleUpdatePayment = async (studentId: number, paidTillDate: string) => {
        try {
            await handleMutation(
                `${API_BASE_URL}/students/${studentId}/payments`,
                'PUT',
                { paid_till: paidTillDate },
                "Payment updated successfully!",
                "Failed to update payment."
            );
            fetchStudentPayments(studentId); // Re-fetch details for current student
            fetchAllStudents(); // Refresh all students list
            fetchPendingStudents(); // Refresh pending students list
        }
        // No explicit catch here, error handled by handleMutation
        catch (e) {} 
    };

    // handleDeleteStudent (updated to send password)
    const handleDeleteStudent = async (studentId: number, studentName: string, passwordConfirmation: string) => {
        try {
            await handleMutation(
                `${API_BASE_URL}/students/${studentId}`,
                'DELETE',
                { password: passwordConfirmation }, // Send password in body for deletion
                `Student '${studentName}' deleted successfully!`,
                `Failed to delete student '${studentName}'.`
            );
            setCurrentPage('allStudents');
            fetchAllStudents();
            fetchPendingStudents();
            setSelectedStudent(null);
            setStudentPayments(null);
        }
        // No explicit catch here, error handled by handleMutation
        catch (e) {} 
    };

    // Initial data fetch is now dependent on isLoggedIn
    useEffect(() => {
        // Assume logged in for initial state if no explicit login required
        // For this demo, user must explicitly log in.
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            fetchAllStudents();
            fetchPendingStudents();
        } else {
            // Clear data if logged out
            setStudents(null);
            setPendingStudents(null);
            setSelectedStudent(null);
            setStudentPayments(null);
        }
    }, [isLoggedIn, fetchAllStudents, fetchPendingStudents]);

    const handleLogout = () => {
        setIsLoggedIn(false);
        setSuccessMessage("Logged out successfully.");
        setCurrentPage('allStudents'); // Redirect to All Students or Login Page
    };

    const viewStudentDetail = (student: Student, mode: 'full' | 'pending-summary') => {
        setSelectedStudent(student);
        setCurrentPage('studentDetail');
        fetchStudentPayments(student.id);
        // Store the view mode so StudentDetail knows how to render
        localStorage.setItem('studentDetailViewMode', mode); 
    };

    const renderPage = () => {
        if (!isLoggedIn) {
            return <AuthForm API_BASE_URL={API_BASE_URL} setIsLoggedIn={setIsLoggedIn} setError={setError} setSuccessMessage={setSuccessMessage} />;
        }

        // Get view mode from localStorage when rendering StudentDetail
        const studentDetailViewMode = localStorage.getItem('studentDetailViewMode') as 'full' | 'pending-summary' || 'full';


        if (currentPage === 'changePassword') {
            return <ChangePasswordForm 
                        API_BASE_URL={API_BASE_URL} 
                        setError={setError} 
                        setSuccessMessage={setSuccessMessage} 
                        onPasswordChangeSuccess={() => setCurrentPage('settings')} // Go back to settings after change
                   />;
        }
        if (currentPage === 'settings') {
            return <SettingsPage 
                        API_BASE_URL={API_BASE_URL} 
                        setError={setError} 
                        setSuccessMessage={setSuccessMessage} 
                        setCurrentPage={setCurrentPage} 
                        handleLogout={handleLogout} 
                   />;
        }

        // Only show loading indicator, not content, when loading
        if (loading) return null; // LoadingOverlay will cover this.

        switch (currentPage) {
            case 'allStudents':
                return <StudentList students={students} title="All Students" onSelectStudent={(s, mode) => viewStudentDetail(s, mode)} />;
            case 'pendingStudents':
                return (
                    <div className="bg-white p-4 rounded-2xl shadow-lg mb-6 mx-auto w-full max-w-xl">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">Students with Pending Fees</h2>
                        {!pendingStudents || pendingStudents.length === 0 ? (
                            <div className="bg-white p-6 rounded-2xl shadow-lg text-center text-gray-600 mt-8">
                                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p>No students with pending fees found.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {pendingStudents.map(student => (
                                    <li 
                                        key={student.id} 
                                        onClick={() => viewStudentDetail(student, 'pending-summary')}
                                        className="py-3 px-4 flex items-center justify-between transition duration-200 ease-in-out hover:bg-red-50/20 rounded-lg cursor-pointer -mx-2 border border-red-100" // Softer red border
                                    >
                                        <div className="flex-1 min-w-0 flex items-center pr-2"> {/* Added some right padding */}
                                            <XCircle className="w-6 h-6 mr-3 text-red-500 flex-shrink-0" /> {/* Slightly less strong red icon */}
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-lg font-semibold text-gray-900 truncate">{student.name}</p>
                                                <p className="text-sm text-gray-500 flex items-center mt-1">
                                                    <CheckCircle className="w-4 h-4 mr-1 text-green-500 flex-shrink-0" />
                                                    Paid Till: {student.paid_till ? new Date(student.paid_till).toLocaleDateString() : 'N/A'}
                                                </p>
                                                <p className="text-sm text-red-600 font-bold mt-1 flex items-center">
                                                    <DollarSign className="w-4 h-4 mr-1 text-red-500 flex-shrink-0" />
                                                    Pending: ₹{student.pending_amount} ({student.pending_months} months)
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                );
            case 'addStudent':
                return <AddStudentForm handleAddStudent={handleAddStudent} setError={setError} />;
            case 'studentDetail':
                if (!selectedStudent || studentPayments === null) {
                    return (
                        <div className="bg-white p-6 rounded-2xl shadow-lg text-center text-gray-600 mt-8">
                            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p>Loading student details or an error occurred.</p>
                        </div>
                    );
                }

                return (
                    <StudentDetail
                        student={selectedStudent}
                        payments={studentPayments.payments}
                        onUpdatePayment={handleUpdatePayment}
                        onBackToList={() => setCurrentPage('allStudents')}
                        handleDeleteStudent={handleDeleteStudent}
                        setError={setError}
                        setSuccessMessage={setSuccessMessage} // Pass setSuccessMessage
                        pendingDataForStudent={{
                            pending_months: studentPayments.pending_months,
                            pending_amount: studentPayments.pending_amount,
                            paid_till: studentPayments.payments.length > 0 ? studentPayments.payments[0].paid_till : null
                        }}
                        // allStudents={students} // Removed this prop as it's not used in StudentDetail
                        viewMode={studentDetailViewMode} // Pass the determined view mode
                    />
                );
            case 'reminders':
                return <ReminderList allStudents={students} setError={setError} setSuccessMessage={setSuccessMessage} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-24 sm:pb-4 relative">
            {/* IMPORTANT: For your Vite project, you MUST remove these CDN and inline style tags.
                Instead, install Tailwind and Lucide-React via npm and configure them
                as per their official documentation in your Vite project setup (tailwind.config.js, src/index.css, etc.).
                These direct HTML includes are primarily for the Canvas environment's immediate preview. */}
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                body {
                    font-family: 'Inter', sans-serif;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    background-color: #F9FAFB; /* Light background */
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
                    box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06);
                }
                body::-webkit-scrollbar {
                    display: none;
                }
                body {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                `}
            </style>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />

            <LoadingOverlay isLoading={loading} /> {/* Global Loading Indicator */}

            <Header isLoggedIn={isLoggedIn} setCurrentPage={setCurrentPage} />

            <main className="max-w-4xl mx-auto px-4 pt-4">
                <MessageDisplay message={error} type="error" />
                <MessageDisplay message={successMessage} type="success" />
                {renderPage()}
            </main>

            {isLoggedIn && ( // Only show navigation if logged in
                <Navigation
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    fetchPendingStudents={fetchPendingStudents}
                />
            )}
        </div>
    );
};

export default App;
