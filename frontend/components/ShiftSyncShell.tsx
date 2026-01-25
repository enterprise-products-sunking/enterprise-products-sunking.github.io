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
    Users,
    LogOut,
    Settings
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
import ProfileEditModal from './ProfileEditModal';

import { getInitialShifts, EMPLOYEES } from '../constants';
import { Shift, Employee, ViewMode, UserRole, ShiftStatus } from '../types';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { shiftService } from '@/services/shiftService';
import { userService } from '@/services/userService';
import { authService } from '@/services/authService';
import { getTimezoneAbbreviation } from '@/lib/timezone';

const ShiftSyncShell: React.FC = () => {
    // 1. All Hooks declarations must be at the top level
    const [mounted, setMounted] = useState(false);
    const [userTimezone, setUserTimezone] = useState<string>('');

    // Data State
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [myShifts, setMyShifts] = useState<Shift[]>([]);
    const [marketplaceShifts, setMarketplaceShifts] = useState<any[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [currentUser, setCurrentUser] = useState<Employee | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // View State
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week);

    // Navigation State
    const [activeTab, setActiveTab] = useState<'calendar' | 'members' | 'my_shift'>('calendar');

    // Modal States
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
    const [selectedShift, setSelectedShift] = useState<Partial<Shift> | null>(null);

    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Partial<Employee> | null>(null);

    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const refreshData = React.useCallback(async () => {
        setIsLoadingData(true);
        try {
            // Fetch User Profile
            try {
                const profile = await userService.getMyProfile();
                setCurrentUser(profile);
            } catch (e) {
                console.warn("Failed to fetch user profile", e);
            }

            const storedRole = localStorage.getItem("user_role");

            // Prepare fetch promises with individual error handling
            const globalShiftsPromise = shiftService.listAllShifts().catch(err => {
                console.warn("Global shifts fetch skipped or restricted:", err.message);
                return [];
            });

            const myShiftsPromise = shiftService.listMyShifts().catch(err => {
                console.warn("Personal shifts fetch failed:", err.message);
                return [];
            });

            const marketplacePromise = shiftService.listMarketplace().catch(err => {
                console.warn("Marketplace fetch failed:", err.message);
                return [];
            });

            const employeesPromise = (storedRole === 'admin')
                ? userService.listUsers().catch(() => EMPLOYEES)
                : Promise.resolve(EMPLOYEES);

            // Execute all in parallel
            const [allResults, myResults, marketResults, empResults] = await Promise.all([
                globalShiftsPromise,
                myShiftsPromise,
                marketplacePromise,
                employeesPromise
            ]);

            // Update state
            setShifts(allResults.length > 0 ? allResults : getInitialShifts());
            setMyShifts(myResults);
            setMarketplaceShifts(marketResults);
            setEmployees(empResults);
        } catch (error: any) {
            console.error("Critical error in fetchData:", error);
            setShifts(getInitialShifts());
            setEmployees(EMPLOYEES);
            toast.error("Demonstration mode: Limited permissions or backend offline.");
        } finally {
            setIsLoadingData(false);
        }
    }, []);

    // Effect for hydration and loading data
    useEffect(() => {
        setMounted(true);
        setCurrentDate(new Date());
        setUserTimezone(getTimezoneAbbreviation());

        // Load role from localStorage
        const storedRole = localStorage.getItem("user_role");
        if (storedRole === 'admin') {
            setUserRole(UserRole.Admin);
        } else if (storedRole === 'member') {
            setUserRole(UserRole.Employee);
        } else {
            setUserRole(UserRole.Employee); // Default to employee/member
        }

        refreshData();
    }, [refreshData]);

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

    const handleApproveShift = async (id: string) => {
        try {
            await shiftService.approveShift(id);
            toast.success("Shift approved successfully");

            // Update both global and personal lists
            const updateList = (prev: Shift[]) => prev.map(s =>
                s.id === id ? { ...s, status: ShiftStatus.Confirmed } : s
            );

            setShifts(updateList);
            setMyShifts(updateList);
            setIsShiftModalOpen(false);
        } catch (error: any) {
            toast.error("Failed to approve shift: " + error.message);
        }
    };

    const handleRejectShift = async (id: string) => {
        try {
            await shiftService.rejectShift(id);
            toast.info("Shift rejected");

            // Remove from both lists
            const filterList = (prev: Shift[]) => prev.filter(s => s.id !== id);

            setShifts(filterList);
            setMyShifts(filterList);
            setIsShiftModalOpen(false);
        } catch (error: any) {
            toast.error("Failed to reject shift: " + error.message);
        }
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

    const handleSaveMember = async (memberData: Partial<Employee>) => {
        try {
            if (memberData.id) {
                await userService.updateUser(memberData.id, {
                    full_name: memberData.name,
                    phone_number: memberData.phone,
                    isd_code: memberData.isd_code
                });
                toast.success('Member updated');
            } else {
                await userService.createUser({
                    email: memberData.email!,
                    phone_number: memberData.phone!,
                    full_name: memberData.name,
                    role: (memberData.role as 'admin' | 'member') || 'member',
                    isd_code: memberData.isd_code
                });
                toast.success('Member added');
            }
            refreshData();
            setIsMemberModalOpen(false);
        } catch (error: any) {
            toast.error("Failed to save member: " + error.message);
        }
    };

    const handleDeleteMember = async (id: string) => {
        try {
            await userService.deleteUser(id);
            toast.success('Member removed');
            refreshData();
            setIsMemberModalOpen(false);
        } catch (error: any) {
            toast.error("Failed to delete member: " + error.message);
        }
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
        { id: 'members', label: 'Members', icon: Users, adminOnly: true },
    ].filter(tab => !tab.adminOnly || userRole === UserRole.Admin);

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
                            {userTimezone && (
                                <Badge variant="outline" className="ml-2 text-[10px] font-normal text-slate-500 bg-slate-50 border-slate-200">
                                    {userTimezone}
                                </Badge>
                            )}
                        </div>
                    </motion.div>
                )}

                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-slate-600 hover:bg-white/50">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white/50"></span>
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="flex items-center gap-2 pl-4 border-l border-slate-200 cursor-pointer hover:bg-slate-50/50 rounded-lg px-2 py-1 transition-colors">
                                <div className="text-right hidden md:block">
                                    <p className="text-sm font-semibold text-slate-700 leading-none">
                                        {currentUser?.name || (userRole === UserRole.Admin ? 'Admin User' : 'Staff Member')}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {userRole === UserRole.Admin ? 'System Administrator' : 'Shift Employee'}
                                    </p>
                                </div>
                                <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-slate-100">
                                    <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white uppercase font-bold text-xs">
                                        {currentUser?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{currentUser?.name || 'User'}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {currentUser?.email || ''}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Edit Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => {
                                    authService.logout();
                                    window.location.href = '/login';
                                }}
                                className="text-red-600 focus:text-red-600"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    {isLoadingData ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex items-center justify-center bg-white/50 backdrop-blur-sm z-50 absolute inset-0"
                        >
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-slate-500 font-medium animate-pulse">Syncing schedule...</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="w-full h-full flex flex-col min-h-0"
                        >
                            {activeTab === 'members' ? (
                                <MembersView
                                    employees={employees}
                                    onAddMember={handleAddMember}
                                    onEditMember={handleEditMember}
                                    onDeleteMember={(emp) => handleDeleteMember(emp.id)}
                                />
                            ) : activeTab === 'my_shift' ? (
                                <MyShiftView
                                    employees={employees}
                                    shifts={myShifts}
                                    marketplaceShifts={marketplaceShifts}
                                    onRefresh={refreshData}
                                />
                            ) : (
                                /* Calendar Container */
                                <main className="flex-1 flex flex-col relative min-h-0">
                                    {/* Toolbar */}
                                    <div className="h-14 border-b border-slate-100 bg-white/50 backdrop-blur-sm flex items-center justify-between px-6 z-10 flex-shrink-0">
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
                    )}
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
                onApprove={handleApproveShift}
                onReject={handleRejectShift}
                userRole={userRole}
            />

            <MemberModal
                isOpen={isMemberModalOpen}
                member={selectedMember}
                onClose={() => setIsMemberModalOpen(false)}
                onSave={handleSaveMember}
                onDelete={handleDeleteMember}
            />

            <ProfileEditModal
                isOpen={isProfileModalOpen}
                currentUser={currentUser}
                onClose={() => setIsProfileModalOpen(false)}
                onProfileUpdated={refreshData}
            />
        </div>
    );
};

export default ShiftSyncShell;
