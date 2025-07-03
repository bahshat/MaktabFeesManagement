import { BarChart2, PieChart } from "lucide-react";
import type { DashboardProps } from "../common/types";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export const Dashboard: React.FC<DashboardProps> = ({ data, currentLanguage }) => {
    if (data===null) {
        return (
            <div className="mb-6 mx-auto w-full">
                <div className="bg-blue-50 p-6 rounded-xl shadow-inner text-center text-gray-600">
                    <BarChart2 className="w-12 h-12 mx-auto mb-4 text-blue-300" />
                    <p className="text-lg font-medium">{currentLanguage === 'en' ? 'No student data available for dashboard.' : 'ڈیش بورڈ کے لیے کوئی طالب علم ڈیٹا دستیاب نہیں ہے۔'}</p>
                </div>
            </div>
        );
    }

    const totalStudents = 250//data.totalStudents;
    const pendingStudentsCount = 35// data.pendingStudents;
    const clearedStudentsCount = 215 //data.clearedStudent;
    const totalPendingAmount = 35*400//data.totalPendingAmount;


    const pieData = [
        { name: currentLanguage === 'en' ? 'Cleared' : 'صاف شدہ', value: clearedStudentsCount },
        { name: currentLanguage === 'en' ? 'Pending' : 'زیر التواء', value: pendingStudentsCount },
    ];
    const PIE_COLORS = ['#4CAF50', '#FFC107', '#2196F3', '#9C27B0'];


    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6 mx-auto w-full border border-blue-50 flex flex-col items-center">
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
                                {pieData.map((entry, index) => {
                                    console.log(`Rendering pie slice for ${entry.name} with value ${entry.value}`);
                                    return (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    )
                                })}
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
