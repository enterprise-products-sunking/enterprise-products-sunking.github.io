export enum ViewMode {
    Day = 'day',
    Week = 'week',
    Month = 'month',
    List = 'list'
}

export enum UserRole {
    Admin = 'admin',
    Employee = 'employee',
    Public = 'public'
}

export enum ShiftStatus {
    Confirmed = 'confirmed',
    Pending = 'pending',
    RequestedOff = 'requested_off',
    Open = 'open'
}

export interface Employee {
    id: string;
    name: string;
    role: string;
    avatar: string;
    color: string; // Tailwind color class specific like 'bg-blue-500' or hex
    department: string;
    weeklyHours: number;
    maxHours: number;
    email: string;
    phone: string;
}

export interface Shift {
    id: string;
    employeeId: string | null; // null for open shifts
    start: Date;
    end: Date;
    role: string;
    status: ShiftStatus;
    notes?: string;
    isDragging?: boolean;
}

export interface SwapRequest {
    id: string;
    requesterId: string;
    originalShiftId: string;
    targetShiftId?: string; // If swapping for specific shift
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
}
