// AddStudentForm.tsx

import { useEffect } from "react";
import type { AddStudentFormProps } from "../common/types";


export const AddStudentForm: React.FC<AddStudentFormProps> = ({ studentData, setStudentData, currentLanguage }) => {
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        if (!studentData.admission_date) {
            setStudentData(prev => ({ ...prev, admission_date: today }));
        }
        if (studentData.monthly_fee === undefined || studentData.monthly_fee === null || isNaN(studentData.monthly_fee)) {
            setStudentData(prev => ({ ...prev, monthly_fee: 400 }));
        }
    }, [studentData.admission_date, studentData.monthly_fee, setStudentData, today]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setStudentData(prev => ({ ...prev, [id]: value }));
    };

    const handleMonthlyFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStudentData(prev => ({ ...prev, monthly_fee: parseFloat(e.target.value) || 0 }));
    };

    const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStudentData(prev => ({ ...prev, age: parseInt(e.target.value) || null }));
    };


    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 mx-auto w-full">
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
                        placeholder={currentLanguage === 'en' ? "e.g., Junaid or Umar" : "مثلاً، سارہ یا فاطمہ"}
                        required
                    />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 sm:w-1/3 sm:min-w-[120px] mb-1 sm:mb-0">
                        {currentLanguage === 'en' ? 'Age' : 'عمر'}
                    </label>
                    <input
                        type="number"
                        id="age"
                        className="flex-1 mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={studentData.age || ''}
                        onChange={handleAgeChange}
                        placeholder={currentLanguage === 'en' ? "e.g., 10" : "مثلاً، 10"}
                    />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                    <label htmlFor="student_class" className="block text-sm font-medium text-gray-700 sm:w-1/3 sm:min-w-[120px] mb-1 sm:mb-0">
                        {currentLanguage === 'en' ? 'Class' : 'کلاس'}
                    </label>
                    <input
                        type="text"
                        id="student_class"
                        className="flex-1 mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={studentData.student_class || ''}
                        onChange={handleChange}
                        placeholder={currentLanguage === 'en' ? "e.g., 5" : "مثلاً، 5"}
                    />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 sm:w-1/3 sm:min-w-[120px] mb-1 sm:mb-0 pt-2">
                        {currentLanguage === 'en' ? 'Address (Optional)' : 'پتہ (اختیاری)'}
                    </label>
                    <textarea
                        id="address"
                        rows={3}
                        className="flex-1 mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out resize-y"
                        value={studentData.address || ''}
                        onChange={handleChange}
                        placeholder={currentLanguage === 'en' ? "e.g., Unity Park, Sr. No. 42" : "مثلاً، یونٹی پارک، انعام نگر "}
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
                        placeholder={currentLanguage === 'en' ? "e.g., +919876543210" : "مثلاً، 919876543210"}
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
