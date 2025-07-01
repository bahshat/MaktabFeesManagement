import { useState } from "react";
import type { ReminderListProps, Student } from "../common/types";
import { BellRing, CalendarDays, CheckCircle, DollarSign, MessageSquare, MessageSquareText, Phone, Search, User } from "lucide-react";
import { formatDate } from "../common/utils";


export const ReminderList: React.FC<ReminderListProps> = ({ allStudents, setError, setSuccessMessage, currentLanguage }) => {
    const [reminderPeriod, setReminderPeriod] = useState<string>('all_pending');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filteredStudents = allStudents?.filter(student => {
        const matchesSearch = searchTerm ? student.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
        if (!matchesSearch) return false;

        const lastPaidDate = student.paid_till ? new Date(student.paid_till) : new Date(student.admission_date);
        lastPaidDate.setHours(0, 0, 0, 0);

        let nextPaymentDueDate = new Date(lastPaidDate);
        nextPaymentDueDate.setMonth(lastPaidDate.getMonth() + 1);
        nextPaymentDueDate.setDate(1);
        nextPaymentDueDate.setHours(0, 0, 0, 0);


        const isCurrentlyOverdue = (student.pending_amount && student.pending_amount > 0);

        if (reminderPeriod === 'all_pending') {
            return isCurrentlyOverdue;
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

        const isDueWithinWindow = nextPaymentDueDate >= today && nextPaymentDueDate <= (
            reminderPeriod === '1_week' ? oneWeekFromNow :
                reminderPeriod === '2_weeks' ? twoWeeksFromNow :
                    oneMonthFromNow
        );

        return isCurrentlyOverdue || isDueWithinWindow;
    }) || [];

    const sortedReminderStudents = filteredStudents.sort((a, b) => {
        const dateA = a.paid_till ? new Date(a.paid_till).getTime() : new Date(a.admission_date).getTime();
        const dateB = b.paid_till ? new Date(b.paid_till).getTime() : new Date(b.admission_date).getTime();
        return dateA - dateB;
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
                handleSendReminder(student, type);
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
        setSelectedStudents([]);
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 mx-auto w-full border border-blue-50">
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
