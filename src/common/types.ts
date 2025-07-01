// --- Type Definitions ---
export interface Student {
    id: number;
    name: string;
    address: string | null;
    phone: string | null;
    admission_date: string;
    admission_cancel_date: string | null;
    monthly_fee: number;
    paid_till?: string;
    pending_months?: number;
    pending_amount?: number;
    age: number | null;
    student_class: number | null;
}

export interface Payment {
    id: number;
    student_id: number;
    paid_till: string;
}

export interface StudentPaymentDetailsResponse {
    student: Student;
    payments: Payment[];
    pending_months: number;
    pending_amount: number;
}

export interface ErrorResponse {
    error: string;
}


// LoadingOverlay.tsx
export interface LoadingOverlayProps {
    isLoading: boolean;
}

// StudentList.tsx
export interface StudentListProps {
    students: Student[] | null;
    title: string;
    onSelectStudent: (student: Student, viewMode: 'full' | 'pending-summary') => void;
    currentLanguage: 'en' | 'ur';
}

export interface AddStudentFormData {
    name: string;
    address: string | null;
    phone: string | null;
    admission_date: string;
    initial_paid_till: string;
    monthly_fee: number;
    age: number | null;
    student_class: string | null;
}

export interface AddStudentFormProps {
    studentData: AddStudentFormData;
    setStudentData: React.Dispatch<React.SetStateAction<AddStudentFormData>>;
    setError: (message: string | null) => void;
    currentLanguage: 'en' | 'ur';
}

// Dashboard.tsx
export interface DashboardProps {
    students: Student[] | null;
    currentLanguage: 'en' | 'ur';
}

// PendingStudentList.tsx
export interface PendingStudentListProps {
    students: Student[] | null;
    title: string;
    onSelectStudent: (student: Student, viewMode: 'full' | 'pending-summary') => void;
    currentLanguage: 'en' | 'ur';
}

// SettingsPage.tsx
export interface SettingsPageProps {
    setCurrentPage: (page: string) => void;
    currentLanguage: 'en' | 'ur';
    toggleLanguage: () => void;
    handleChangePassword: (passwords: { old_password: string; new_password: string; }) => Promise<void>;
    setError: (message: string | null) => void;
    setSuccessMessage: (message: string | null) => void;
    handleLogout: () => void;
}

// ChangePasswordForm.tsx
export interface ChangePasswordFormProps {
    handleChangePassword: (passwords: { old_password: string; new_password: string; }) => Promise<void>;
    setError: (message: string | null) => void;
    setSuccessMessage: (message: string | null) => void;
    currentLanguage: 'en' | 'ur';
    setCurrentPage: (page: string) => void;
}

// AuthForm.tsx
export interface AuthFormProps {
    handleLogin: (credentials: { username: string; password: string; }) => Promise<void>;
    setError: (message: string | null) => void;
    currentLanguage: 'en' | 'ur';
}


// ReminderList.tsx
export interface ReminderListProps {
    allStudents: Student[] | null;
    setError: (message: string | null) => void;
    setSuccessMessage: (message: string | null) => void;
    currentLanguage: 'en' | 'ur';
}

// Navigation.tsx
export interface NavigationProps {
    currentPage: string;
    setCurrentPage: (page: string) => void;
    fetchPendingStudents: () => void;
    fetchAllStudents: () => void;
    currentLanguage: 'en' | 'ur';
    isLoggedIn: boolean;
}

// Header.tsx
export interface HeaderProps {
    setCurrentPage: (page: string) => void;
    currentLanguage: 'en' | 'ur';
    isLoggedIn: boolean;
    currentPage: string;
}
