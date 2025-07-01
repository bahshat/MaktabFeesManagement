import { useState } from "react";
import type { PendingStudentListProps } from "../common/types";
import { Clock, Search, XCircle } from "lucide-react";
import { formatDate } from "../common/utils";

export const PendingStudentList: React.FC<PendingStudentListProps> = ({ students, title, onSelectStudent, currentLanguage }) => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortBy, setSortBy] = useState<'amount' | 'longest_pending'>('amount');

    const filteredStudents = students?.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const sortedStudents = [...filteredStudents].sort((a, b) => {
        if (sortBy === 'amount') {
            return (b.pending_amount || 0) - (a.pending_amount || 0);
        } else {
            const dateA = a.paid_till ? new Date(a.paid_till).getTime() : new Date(a.admission_date).getTime();
            const dateB = b.paid_till ? new Date(b.paid_till).getTime() : new Date(b.admission_date).getTime();
            return dateA - dateB;
        }
    });

    return (
        <div className="mb-6 mx-auto w-full">
            <h2 className="text-2xl font-bold mb-5 text-gray-800 text-center">{title}</h2>

            <div className="bg-white p-6 rounded-2xl shadow-xl border border-blue-50 mb-0">
                <div className="relative">
                    <input
                        type="text"
                        placeholder={currentLanguage === 'en' ? "Search students by name..." : "طالب علم کا نام تلاش کریں..."}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
            </div>

            <div className="flex justify-center bg-gray-100 rounded-xl p-1 mt-4 mb-0 shadow-sm">
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
                <div className="bg-white rounded-2xl shadow-xl border border-blue-50 mt-0 pt-0">
                    <ul className="divide-y divide-blue-50">
                        {sortedStudents.map(student => (
                            <li
                                key={student.id}
                                onClick={() => onSelectStudent(student, 'pending-summary')}
                                className="py-4 px-3 flex items-center justify-between transition duration-200 ease-in-out hover:bg-blue-50 rounded-xl cursor-pointer"
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