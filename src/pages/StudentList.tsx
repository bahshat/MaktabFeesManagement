// StudentDetail.tsx
import type { StudentListProps} from '../common/types';
import React, { useState } from 'react';

import {BookOpen, GraduationCap, Search} from 'lucide-react';              



export const StudentList: React.FC<StudentListProps> = ({ students, title, onSelectStudent, currentLanguage }) => {
    const [searchTerm, setSearchTerm] = useState<string>('');

    const filteredStudents = students?.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

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
                <div className="bg-white rounded-2xl shadow-xl border border-blue-50 mt-0 pt-0">
                    <ul className="divide-y divide-blue-50">
                        {filteredStudents.map(student => (
                            <li
                                key={student.id}
                                onClick={() => onSelectStudent(student, 'full')}
                                className="py-4 px-3 flex items-center justify-between transition duration-200 ease-in-out hover:bg-blue-50 rounded-xl cursor-pointer"
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
