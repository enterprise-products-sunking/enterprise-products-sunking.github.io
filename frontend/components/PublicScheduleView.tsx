"use client";

import React, { useState, useEffect } from 'react';
import { addDays, startOfWeek, subWeeks, addWeeks, format, subMonths, addMonths } from 'date-fns';
import {
    ChevronLeft,
    ChevronRight,
    Users,
    Calendar as CalendarIcon
} from 'lucide-react';

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
                // Note: MonthView might expect click handlers, we pass no-ops or appropriate read-only behavior
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
                // CalendarGrid expects interaction handlers. 
                // Since it's reused, we pass no-ops. 
                // ideally CalendarGrid should support a `readOnly` prop to disable drag/drop.
                // For now, passing no-ops will prevent state updates, effectively making it read-only.
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
        <div className="flex flex-col h-screen bg-white">
            {/* Top Navigation - Simplified for Public View */}
            <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 z-20 shadow-sm relative">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md">
                        <CalendarIcon className="w-5 h-5" />
                        <span className="font-semibold text-sm">Public Schedule</span>
                    </div>
                </div>

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

                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-slate-500 border-slate-200">
                        Read Only
                    </Badge>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
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
                        {/* No actions in toolbar for public view */}
                    </div>

                    {renderView()}
                </main>
            </div>
        </div>
    );
};

export default PublicScheduleView;
