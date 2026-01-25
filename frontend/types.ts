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
    PendingConfirmation = 'pending_confirmation',
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
    isd_code?: string;
}

export interface Shift {
    id: string;
    assignmentId?: string;
    employeeId: string | null; // null for open shifts
    assignedUser?: {
        id: string;
        name: string;
        email: string;
    };
    start: Date;
    end: Date;
    role: string;
    status: ShiftStatus;
    rawStatus?: string;
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
