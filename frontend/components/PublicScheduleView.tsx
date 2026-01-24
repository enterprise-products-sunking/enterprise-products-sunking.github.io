"use client";

import React, { useState, useEffect } from 'react';
import { addDays, startOfWeek, subWeeks, addWeeks, format, subMonths, addMonths } from 'date-fns';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    LogIn
} from 'lucide-react';
import { motion } from 'framer-motion';

import CalendarGrid from './CalendarGrid';
import MonthView from './MonthView';
import ListView from './ListView';

import { getInitialShifts, EMPLOYEES } from '../constants';
import { Shift, Employee, ViewMode } from '../types';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PublicScheduleView: React.FC = () => {
    // Hooks
    const [mounted, setMounted] = useState(false);

    // Data State
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [employees] = useState<Employee[]>(EMPLOYEES);

    // View State
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week);

    // Effect for hydration
    useEffect(() => {
        setMounted(true);
        setShifts(getInitialShifts());
        setCurrentDate(new Date());
    }, []);

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

    // --- No-op Handlers for Read-Only View ---
    const handleShiftClick = () => { /* Read Only */ };
    const handleShiftMove = () => { /* Read Only */ };
    const handleShiftCreate = () => { /* Read Only */ };
    const handleAssignEmployee = () => { /* Read Only */ };
    const handleAddEmployeeToSlot = () => { /* Read Only */ };

    const renderView = () => {
        switch (viewMode) {
            case ViewMode.Month:
                return (
                    <MonthView
                        currentDate={currentDate}
                        shifts={shifts}
                        employees={employees}
                        onShiftClick={handleShiftClick}
                        onNewShift={() => { }} // No-op
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
                        readOnly={true}
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
        <div className="flex flex-col h-screen bg-slate-50/50">
            {/* Top Navigation - Public View */}
            <header className="h-16 glass sticky top-0 z-50 px-6 flex items-center justify-between shadow-sm transition-all">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 font-bold text-xl text-slate-800">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-blue-500/20 shadow-lg">
                            S
                        </div>
                        ShiftSync
                        <Badge variant="secondary" className="ml-2 font-normal bg-blue-50 text-blue-700 border-blue-100">
                            Public View
                        </Badge>
                    </div>
                </div>

                <div className="flex items-center gap-4 absolute left-1/2 transform -translate-x-1/2">
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
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        size="sm"
                        className="bg-slate-900 hover:bg-slate-800 text-white shadow-md rounded-lg"
                        onClick={() => window.location.href = '/login'}
                    >
                        <LogIn className="w-4 h-4 mr-2" />
                        Staff Login
                    </Button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden relative">
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

                        <div className="text-xs text-slate-400 font-medium">
                            Read-only access
                        </div>
                    </div>

                    {renderView()}
                </main>
            </div>
        </div>
    );
};

export default PublicScheduleView;
