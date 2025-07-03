// StudentDetail.tsx
import type { Student, Payment} from '../common/types';
import React, { useState } from 'react';
import { formatDate } from '../common/utils';

import {
    CheckCircle,
    XCircle,
    ChevronDown,
    ChevronUp,
    MessageSquare,
    MessageSquareText
} from 'lucide-react';              

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

export const StudentDetail: React.FC<StudentDetailProps> = ({ student, payments, onUpdatePayment, setError, setSuccessMessage, pendingDataForStudent, viewMode, currentLanguage }) => {
    const [newPaidTill, setNewPaidTill] = useState<string>('');
    const [isCurrentPendingOpen, setIsCurrentPendingOpen] = useState(viewMode === 'pending-summary');
    const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = useState(viewMode === 'pending-summary');
    const [isUpdatePaymentOpen, setIsUpdatePaymentOpen] = useState(viewMode === 'pending-summary');
    const [isReminderSectionOpen, setIsReminderSectionOpen] = useState(viewMode === 'pending-summary');

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
        today.setHours(0, 0, 0, 0);

        if (baseDate <= today) {
            newDate.setMonth(newDate.getMonth() + 1);
        }

        newDate.setMonth(newDate.getMonth() + (months - 1));

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

    const isFeesCleared = pendingDataForStudent.pending_amount === 0 || pendingDataForStudent.pending_amount === undefined;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 mx-auto w-full border border-blue-50">
            <h2 className="text-2xl font-bold mb-2 text-gray-800 text-center">
                {student.name}
            </h2>

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
           
        </div>
    );
};