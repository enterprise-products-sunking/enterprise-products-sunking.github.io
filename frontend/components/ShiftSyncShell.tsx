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
import { motion, AnimatePresence } from 'framer-motion';

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

    const tabs = [
        { id: 'calendar', label: 'Calendar', icon: null },
        { id: 'my_shift', label: 'My Shift', icon: Briefcase },
        { id: 'members', label: 'Members', icon: Users },
    ] as const;

    return (
        <div className="flex flex-col h-screen bg-slate-50/50">
            <Toaster position="bottom-center" />

            {/* Top Navigation */}
            <header className="h-16 glass sticky top-0 z-50 px-6 flex items-center justify-between shadow-sm transition-all">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 font-bold text-xl text-slate-800">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-blue-500/20 shadow-lg">
                            S
                        </div>
                        ShiftSync
                    </div>

                    <div className="flex items-center bg-slate-100/50 p-1 rounded-xl">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id as any);
                                    if (tab.id === 'calendar') setUserRole(UserRole.Admin);
                                }}
                                className={`
                                    relative px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 z-10 flex items-center gap-2
                                    ${activeTab === tab.id ? 'text-blue-700' : 'text-slate-500 hover:text-slate-700'}
                                `}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/50"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        style={{ zIndex: -1 }}
                                    />
                                )}
                                {tab.icon && <tab.icon className="w-4 h-4" />}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === 'calendar' && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-4 absolute left-1/2 transform -translate-x-1/2"
                    >
                        <div className="flex items-center bg-white rounded-full border border-slate-200 shadow-sm p-1 pr-4">
                            <div className="flex items-center gap-1 mr-4">
                                <Button variant="ghost" size="icon" onClick={handlePrev} className="h-7 w-7 rounded-full text-slate-600 hover:bg-slate-100">
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={handleNext} className="h-7 w-7 rounded-full text-slate-600 hover:bg-slate-100">
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                            <Button variant="ghost" onClick={handleToday} className="px-3 py-1 h-auto text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full mr-3">
                                Today
                            </Button>
                            <span className="text-sm font-semibold text-slate-700 min-w-[120px] text-center">
                                {getDateRangeLabel()}
                            </span>
                        </div>
                    </motion.div>
                )}

                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-slate-600 hover:bg-white/50">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white/50"></span>
                    </Button>

                    <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-semibold text-slate-700 leading-none">Admin User</p>
                            <p className="text-xs text-slate-400 mt-1">Super Admin</p>
                        </div>
                        <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-slate-100">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                                AD
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full flex flex-col"
                    >
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
                            <main className="flex-1 flex flex-col relative">
                                {/* Toolbar */}
                                <div className="h-14 border-b border-slate-100 bg-white/50 backdrop-blur-sm flex items-center justify-between px-6 z-10">
                                    <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
                                        {(['week', 'month', 'list'] as const).map((mode) => (
                                            <button
                                                key={mode}
                                                onClick={() => setViewMode(mode as ViewMode)}
                                                className={`
                                                    px-3 py-1 text-xs font-semibold rounded-md capitalize transition-all
                                                    ${viewMode === mode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}
                                                `}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-3">
                                        {userRole === UserRole.Admin && (
                                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleShiftCreate(new Date())}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 text-xs gap-1.5 font-medium px-4 h-9 rounded-lg"
                                                >
                                                    <Plus className="w-4 h-4" /> New Shift
                                                </Button>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>

                                {renderView()}
                            </main>
                        )}
                    </motion.div>
                </AnimatePresence>
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
