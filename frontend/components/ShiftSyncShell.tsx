"use client";

import React, { useState, useEffect } from 'react';
import { addDays, startOfWeek, subWeeks, addWeeks, format, subMonths, addMonths } from 'date-fns';
import {
    ChevronLeft,
    ChevronRight,
    Bell,
    Share2,
    Plus,
    UserCircle,
    Users
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

import CalendarGrid from './CalendarGrid';
import MonthView from './MonthView';
import ListView from './ListView';
import ShiftModal from './ShiftModal';
import MembersView from './MembersView';
import MemberModal from './MemberModal';
import MyShiftView from './MyShiftView';

import { getInitialShifts, EMPLOYEES } from '../constants';
import { Shift, Employee, ViewMode, UserRole, ShiftStatus } from '../types';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase } from 'lucide-react';
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Removed to fix hydration mismatch
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ShiftSyncShell: React.FC = () => {
    // 1. All Hooks declarations must be at the top level
    const [mounted, setMounted] = useState(false);

    // Data State
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [employees, setEmployees] = useState<Employee[]>(EMPLOYEES);

    // View State
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [userRole, setUserRole] = useState<UserRole>(UserRole.Admin);
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week);

    // Navigation State
    const [activeTab, setActiveTab] = useState<'calendar' | 'members' | 'my_shift'>('calendar');

    // Modal States
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
    const [selectedShift, setSelectedShift] = useState<Partial<Shift> | null>(null);

    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Partial<Employee> | null>(null);

    // Effect for hydration
    useEffect(() => {
        setMounted(true);
        setShifts(getInitialShifts());
        setCurrentDate(new Date());
    }, []);

    // 2. Early return AFTER all hooks
    if (!mounted) return null;

    // --- Navigation Handlers ---
    const handlePrev = () => {
        if (viewMode === ViewMode.Month) setCurrentDate(prev => subMonths(prev, 1));
        else setCurrentDate(prev => subWeeks(prev, 1));
    };

    const handleNext = () => {
        if (viewMode === ViewMode.Month) setCurrentDate(prev => addMonths(prev, 1));
        else setCurrentDate(prev => addWeeks(prev, 1));
    };

    const handleToday = () => setCurrentDate(new Date());

    // --- Shift Handlers ---
    const handleShiftClick = (shift: Shift) => {
        setSelectedShift(shift);
        setIsShiftModalOpen(true);
    };

    const handleShiftCreate = (start: Date, end?: Date, employeeId?: string) => {
        const endTime = end || new Date(start.getTime() + 8 * 60 * 60 * 1000);
        setSelectedShift({
            start,
            end: endTime,
            employeeId: employeeId || null,
            role: employeeId ? employees.find(e => e.id === employeeId)?.role : 'Staff',
            status: ShiftStatus.Pending
        });
        setIsShiftModalOpen(true);
    };

    const handleShiftMove = (shiftId: string, newStart: Date, newEnd: Date) => {
        setShifts(prev => prev.map(s =>
            s.id === shiftId ? { ...s, start: newStart, end: newEnd } : s
        ));
        toast.success('Shift moved');
    };

    const handleAssignEmployee = (shiftId: string, employeeId: string) => {
        setShifts(prev => prev.map(s =>
            s.id === shiftId ? { ...s, employeeId } : s
        ));
        toast.success('Assigned employee to shift');
    };

    const handleAddEmployeeToSlot = (start: Date, employeeId: string) => {
        handleShiftCreate(start, undefined, employeeId);
    };

    const handleSaveShift = (data: Partial<Shift> | Partial<Shift>[]) => {
        const itemsToSave = Array.isArray(data) ? data : [data];

        // Check if any item is an update (has ID)
        const updates = itemsToSave.filter(s => s.id);
        const creates = itemsToSave.filter(s => !s.id);

        setShifts(prev => {
            let nextShifts = [...prev];

            // Handle Updates
            updates.forEach(update => {
                nextShifts = nextShifts.map(s => s.id === update.id ? { ...s, ...update } as Shift : s);
            });

            // Handle Creates
            creates.forEach((create, idx) => {
                const newShift: Shift = {
                    ...create,
                    id: `new-${Date.now()}-${idx}`,
                    status: create.status || ShiftStatus.Pending,
                    employeeId: create.employeeId || null,
                } as Shift;
                nextShifts.push(newShift);
            });

            return nextShifts;
        });

        if (updates.length > 0 && creates.length === 0) toast.success('Shift updated');
        else if (creates.length > 0 && updates.length === 0) toast.success(`${creates.length} shift(s) created`);
        else toast.success('Shifts saved');

        setIsShiftModalOpen(false);
    };

    const handleDeleteShift = (id: string) => {
        setShifts(prev => prev.filter(s => s.id !== id));
        setIsShiftModalOpen(false);
        toast.success('Shift deleted');
    };

    // --- Member Handlers ---
    const handleAddMember = () => {
        setSelectedMember(null);
        setIsMemberModalOpen(true);
    };

    const handleEditMember = (member: Employee) => {
        setSelectedMember(member);
        setIsMemberModalOpen(true);
    };

    const handleSaveMember = (memberData: Partial<Employee>) => {
        if (memberData.id) {
            setEmployees(prev => prev.map(e => e.id === memberData.id ? { ...e, ...memberData } as Employee : e));
            toast.success('Member updated');
        } else {
            const newMember: Employee = {
                ...memberData,
                id: `emp-${Date.now()}`,
                avatar: '', // Default or placeholder
                weeklyHours: 0,
                maxHours: 40,
            } as Employee;
            setEmployees(prev => [...prev, newMember]);
            toast.success('Member added');
        }
        setIsMemberModalOpen(false);
    };

    const handleDeleteMember = (id: string) => {
        setEmployees(prev => prev.filter(e => e.id !== id));
        // Also remove shifts for this employee
        setShifts(prev => prev.map(s => s.employeeId === id ? { ...s, employeeId: null, status: ShiftStatus.Open } : s));
        setIsMemberModalOpen(false);
        toast.success('Member removed');
    };



    const renderView = () => {
        switch (viewMode) {
            case ViewMode.Month:
                return (
                    <MonthView
                        currentDate={currentDate}
                        shifts={shifts}
                        employees={employees}
                        onShiftClick={handleShiftClick}
                        onNewShift={(date: Date) => handleShiftCreate(date)}
                        onDateClick={(date: Date) => {
                            setCurrentDate(date);
                            setViewMode(ViewMode.Week);
                        }}
                    />
                );
            case ViewMode.List:
                return (
                    <ListView
                        currentDate={currentDate}
                        shifts={shifts}
                        employees={employees}
                        onShiftClick={handleShiftClick}
                    />
                );
            case ViewMode.Week:
            default:
                return (
                    <CalendarGrid
                        currentDate={currentDate}
                        shifts={shifts}
                        employees={employees}
                        onShiftClick={handleShiftClick}
                        onShiftMove={handleShiftMove}
                        onShiftCreate={handleShiftCreate}
                        onAssignEmployee={handleAssignEmployee}
                        onAddEmployeeToSlot={handleAddEmployeeToSlot}
                        readOnly={false}
                    />
                );
        }
    };

    const getDateRangeLabel = () => {
        if (viewMode === ViewMode.Month) {
            return format(currentDate, 'MMMM yyyy');
        }
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const end = addDays(start, 6);
        return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    };

    return (
        <div className="flex flex-col h-screen bg-white">
            <Toaster position="bottom-center" />

            {/* Top Navigation */}
            <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 z-20 shadow-sm relative">
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-slate-100 p-1 rounded-lg w-[500px] h-10">
                        <button
                            onClick={() => { setActiveTab('calendar'); setUserRole(UserRole.Admin); }}
                            className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all ${activeTab === 'calendar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            Calendar
                        </button>
                        <button
                            onClick={() => setActiveTab('my_shift')}
                            className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === 'my_shift' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            <Briefcase className="w-4 h-4" /> My Shift
                        </button>
                        <button
                            onClick={() => setActiveTab('members')}
                            className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === 'members' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            <Users className="w-4 h-4" /> Members
                        </button>
                    </div>
                </div>

                {activeTab === 'calendar' && (
                    <div className="flex items-center gap-4 animate-in fade-in duration-300">
                        <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 p-0.5">
                            <Button variant="ghost" size="icon" onClick={handlePrev} className="h-8 w-8 text-slate-600">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" onClick={handleToday} className="px-3 text-sm font-semibold text-slate-700 h-8">
                                Today
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleNext} className="h-8 w-8 text-slate-600">
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                        <span className="text-sm font-medium text-slate-600 min-w-[140px] text-center hidden md:block">
                            {getDateRangeLabel()}
                        </span>
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-slate-600">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </Button>

                    <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-600 border border-blue-200">
                            <UserCircle className="w-5 h-5" />
                        </AvatarFallback>
                    </Avatar>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">

                {activeTab === 'members' ? (
                    <MembersView
                        employees={employees}
                        onAddMember={handleAddMember}
                        onEditMember={handleEditMember}
                    />
                ) : activeTab === 'my_shift' ? (
                    <MyShiftView
                        employees={employees}
                        shifts={shifts}
                    />
                ) : (
                    /* Calendar Container */
                    <main className="flex-1 flex flex-col relative animate-in fade-in duration-300">
                        {/* Toolbar */}
                        <div className="h-12 border-b border-slate-100 bg-white flex items-center justify-between px-4">
                            <div className="flex gap-2">
                                {(['week', 'month', 'list'] as const).map((mode) => (
                                    <Button
                                        key={mode}
                                        variant={viewMode === mode ? 'secondary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode(mode as ViewMode)}
                                        className={`text-xs font-semibold capitalize ${viewMode === mode ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'text-slate-500'}`}
                                    >
                                        {mode}
                                    </Button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                {userRole === UserRole.Admin && (
                                    <Button
                                        size="sm"
                                        onClick={() => handleShiftCreate(new Date())}
                                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-xs gap-1.5 font-medium px-4"
                                    >
                                        <Plus className="w-4 h-4" /> New Shift
                                    </Button>
                                )}
                                {/* <Button variant="ghost" size="sm" className="text-slate-500 hover:bg-slate-50 text-xs gap-1">
                                    <Share2 className="w-3 h-3" /> Share
                                </Button> */}
                            </div>
                        </div>

                        {renderView()}
                    </main>
                )}
            </div>

            {/* Modals */}
            <ShiftModal
                isOpen={isShiftModalOpen}
                shift={selectedShift}
                employees={employees}
                onClose={() => setIsShiftModalOpen(false)}
                onSave={handleSaveShift}
                onDelete={handleDeleteShift}
            />

            <MemberModal
                isOpen={isMemberModalOpen}
                member={selectedMember}
                onClose={() => setIsMemberModalOpen(false)}
                onSave={handleSaveMember}
                onDelete={handleDeleteMember}
            />


        </div>
    );
};

export default ShiftSyncShell;
