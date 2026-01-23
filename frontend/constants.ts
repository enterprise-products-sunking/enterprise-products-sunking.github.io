import { Employee, Shift, ShiftStatus } from './types';
import { addDays, setHours, setMinutes, startOfWeek } from 'date-fns';

export const DEPARTMENTS = ['Front of House', 'Kitchen', 'Management', 'Cleaning'];

export const EMPLOYEES: Employee[] = [
    {
        id: 'emp-1',
        name: 'Sarah Chen',
        role: 'Shift Supervisor',
        avatar: 'https://picsum.photos/id/64/100/100',
        color: 'blue',
        department: 'Management',
        weeklyHours: 32,
        maxHours: 40,
        email: 'sarah.chen@shiftsync.com',
        phone: '(555) 123-4567'
    },
    {
        id: 'emp-2',
        name: 'Marcus Johnson',
        role: 'Line Cook',
        avatar: 'https://picsum.photos/id/65/100/100',
        color: 'emerald',
        department: 'Kitchen',
        weeklyHours: 28,
        maxHours: 45,
        email: 'marcus.j@shiftsync.com',
        phone: '(555) 234-5678'
    },
    {
        id: 'emp-3',
        name: 'Emily Davis',
        role: 'Server',
        avatar: 'https://picsum.photos/id/66/100/100',
        color: 'purple',
        department: 'Front of House',
        weeklyHours: 15,
        maxHours: 25,
        email: 'emily.d@shiftsync.com',
        phone: '(555) 345-6789'
    },
    {
        id: 'emp-4',
        name: 'Alex Rivera',
        role: 'Bartender',
        avatar: 'https://picsum.photos/id/67/100/100',
        color: 'orange',
        department: 'Front of House',
        weeklyHours: 38,
        maxHours: 40,
        email: 'alex.r@shiftsync.com',
        phone: '(555) 456-7890'
    },
    {
        id: 'emp-5',
        name: 'Jessica Wu',
        role: 'Host',
        avatar: 'https://picsum.photos/id/68/100/100',
        color: 'pink',
        department: 'Front of House',
        weeklyHours: 20,
        maxHours: 30,
        email: 'jessica.w@shiftsync.com',
        phone: '(555) 567-8901'
    }
];

// Helper to create initial shifts relative to "today"
export const getInitialShifts = (): Shift[] => {
    // We fix the date to a specific reference point for server consistency if needed, 
    // OR just accept that this should only be called on client.
    // For simplicity, we'll use current date but this MUST be called in useEffect on client.
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });

    return [
        {
            id: 's-1',
            employeeId: 'emp-1',
            start: setMinutes(setHours(addDays(startOfCurrentWeek, 0), 9), 0), // Mon 9am
            end: setMinutes(setHours(addDays(startOfCurrentWeek, 0), 17), 0), // Mon 5pm
            role: 'Supervisor',
            status: ShiftStatus.Confirmed
        },
        {
            id: 's-2',
            employeeId: 'emp-2',
            start: setMinutes(setHours(addDays(startOfCurrentWeek, 0), 10), 0), // Mon 10am
            end: setMinutes(setHours(addDays(startOfCurrentWeek, 0), 16), 0), // Mon 4pm
            role: 'Cook',
            status: ShiftStatus.Confirmed
        },
        {
            id: 's-3',
            employeeId: 'emp-3',
            start: setMinutes(setHours(addDays(startOfCurrentWeek, 1), 11), 0), // Tue 11am
            end: setMinutes(setHours(addDays(startOfCurrentWeek, 1), 20), 0), // Tue 8pm
            role: 'Server',
            status: ShiftStatus.Pending
        },
        {
            id: 's-4',
            employeeId: 'emp-4',
            start: setMinutes(setHours(addDays(startOfCurrentWeek, 2), 16), 0), // Wed 4pm
            end: setMinutes(setHours(addDays(startOfCurrentWeek, 2), 23), 59), // Wed 12am
            role: 'Bartender',
            status: ShiftStatus.Confirmed
        },
        {
            id: 's-5',
            employeeId: null, // Open shift
            start: setMinutes(setHours(addDays(startOfCurrentWeek, 3), 9), 0), // Thu 9am
            end: setMinutes(setHours(addDays(startOfCurrentWeek, 3), 15), 0), // Thu 3pm
            role: 'Server',
            status: ShiftStatus.Open,
            notes: 'Urgent coverage needed'
        }
    ];
};
