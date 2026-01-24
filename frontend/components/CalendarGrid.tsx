"use client";

import React, { useRef, useState, useEffect } from 'react';
import { format, addDays, startOfWeek, isSameDay, setHours, setMinutes, differenceInMinutes } from 'date-fns';
import { Shift, Employee } from '../types';
import ShiftCard from './ShiftCard';
import { cn } from "@/lib/utils";

interface CalendarGridProps {
    currentDate: Date;
    shifts: Shift[];
    employees: Employee[];
    onShiftClick: (shift: Shift) => void;
    onShiftMove: (shiftId: string, newStart: Date, newEnd: Date) => void;
    onShiftCreate: (start: Date, end?: Date, employeeId?: string) => void;
    onAssignEmployee: (shiftId: string, employeeId: string) => void;
    onAddEmployeeToSlot: (start: Date, employeeId: string) => void;
    readOnly?: boolean;
}

const START_HOUR = 0;
const END_HOUR = 24;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);
const DAYS = Array.from({ length: 7 }, (_, i) => i); // 0 to 6
const ROW_HEIGHT = 80;

const CalendarGrid: React.FC<CalendarGridProps> = ({
    currentDate,
    shifts,
    employees,
    onShiftClick,
    onShiftMove,
    onShiftCreate,
    onAssignEmployee,
    onAddEmployeeToSlot,
    readOnly = false
}) => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const gridRef = useRef<HTMLDivElement>(null);

    // Selection State
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionStart, setSelectionStart] = useState<{ dayIndex: number, hour: number } | null>(null);
    const [selectionEnd, setSelectionEnd] = useState<{ dayIndex: number, hour: number } | null>(null);

    // Auto-scroll to 8 AM on mount
    useEffect(() => {
        if (gridRef.current) {
            const scrollOffset = (8 - START_HOUR) * ROW_HEIGHT;
            gridRef.current.scrollTop = scrollOffset;
        }
    }, []);

    // Drag State
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, dayOffset: number, hour: number) => {
        e.preventDefault();
        const shiftId = e.dataTransfer.getData('text/shiftId');
        const employeeId = e.dataTransfer.getData('text/employeeId');

        const targetTime = setMinutes(setHours(addDays(weekStart, dayOffset), hour), 0);

        if (shiftId) {
            // Moving an existing shift
            const shift = shifts.find(s => s.id === shiftId);
            if (shift) {
                const duration = differenceInMinutes(shift.end, shift.start);
                const newEnd = new Date(targetTime.getTime() + duration * 60000);
                onShiftMove(shiftId, targetTime, newEnd);
            }
        } else if (employeeId) {
            // Dropping an employee from sidebar to create a new shift or assign
            onAddEmployeeToSlot(targetTime, employeeId);
        }
    };

    const handleDragStartShift = (e: React.DragEvent, shiftId: string) => {
        e.dataTransfer.setData('text/shiftId', shiftId);
        e.dataTransfer.effectAllowed = 'move';
    };

    // Range Selection Handlers
    const handleMouseDown = (dayIndex: number, hour: number, e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('[draggable]')) return;

        setIsSelecting(true);
        setSelectionStart({ dayIndex, hour });
        setSelectionEnd({ dayIndex, hour });
    };

    const handleMouseEnter = (dayIndex: number, hour: number) => {
        if (isSelecting && selectionStart) {
            if (dayIndex === selectionStart.dayIndex) {
                setSelectionEnd({ dayIndex, hour });
            }
        }
    };

    const handleMouseUp = () => {
        if (isSelecting && selectionStart && selectionEnd) {
            const dayDate = addDays(weekStart, selectionStart.dayIndex);

            const startHour = Math.min(selectionStart.hour, selectionEnd.hour);
            const endHour = Math.max(selectionStart.hour, selectionEnd.hour) + 1;

            const start = setMinutes(setHours(dayDate, startHour), 0);
            const end = setMinutes(setHours(dayDate, endHour), 0);

            onShiftCreate(start, end);
        }

        setIsSelecting(false);
        setSelectionStart(null);
        setSelectionEnd(null);
    };

    const renderSelectionBox = (dayIndex: number) => {
        if (!isSelecting || !selectionStart || !selectionEnd || selectionStart.dayIndex !== dayIndex) return null;

        const startH = Math.min(selectionStart.hour, selectionEnd.hour);
        const endH = Math.max(selectionStart.hour, selectionEnd.hour);

        const top = (startH - START_HOUR) * ROW_HEIGHT;
        const height = ((endH - startH) + 1) * ROW_HEIGHT;

        return (
            <div
                className="absolute left-1 right-1 bg-blue-500/30 border-2 border-blue-500 rounded z-20 pointer-events-none flex items-center justify-center"
                style={{ top: `${top}px`, height: `${height}px` }}
            >
                <span className="text-blue-900 font-bold text-xs bg-white/80 px-2 py-1 rounded shadow-sm">
                    {format(setHours(new Date(), startH), 'h a')} - {format(setHours(new Date(), endH + 1), 'h a')}
                </span>
            </div>
        );
    };

    return (
        <div
            className="flex-1 flex flex-col min-h-0 bg-white overflow-hidden relative"
            onMouseUp={handleMouseUp}
            onMouseLeave={() => { if (isSelecting) handleMouseUp(); }}
        >
            {/* Header Row (Days) */}
            <div className="flex border-b border-slate-200 select-none pr-4 shadow-sm z-20">
                <div className="w-16 flex-shrink-0 border-r border-slate-100 bg-slate-50/80 backdrop-blur-sm"></div>
                {DAYS.map(dayOffset => {
                    const date = addDays(weekStart, dayOffset);
                    const isToday = isSameDay(date, new Date());
                    return (
                        <div key={dayOffset} className={cn("flex-1 text-center py-3 border-r border-slate-100", isToday && "bg-blue-50/50")}>
                            <div className={cn("text-xs font-semibold uppercase tracking-wider mb-0.5", isToday ? "text-blue-600" : "text-slate-400")}>
                                {format(date, 'EEE')}
                            </div>
                            <div className={cn("text-xl font-light", isToday ? "text-blue-700 font-normal" : "text-slate-800")}>
                                {format(date, 'd')}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Grid Content */}
            <div className="flex-1 overflow-y-auto relative scroll-smooth bg-slate-50/30" ref={gridRef}>
                <div className="flex relative" style={{ height: `${HOURS.length * ROW_HEIGHT}px` }}>

                    {/* Horizontal Grid Lines Background (Global) */}
                    <div className="absolute inset-0 w-full pointer-events-none z-0">
                        {HOURS.map(hour => (
                            <div key={hour} className="border-b border-slate-100" style={{ height: `${ROW_HEIGHT}px` }}>
                                {/* Half-hour dashed line */}
                                <div className="border-b border-dashed border-slate-50/50 h-1/2 w-full"></div>
                            </div>
                        ))}
                    </div>

                    {/* Time Labels Column */}
                    <div className="w-16 flex-shrink-0 border-r border-slate-100 bg-white/80 backdrop-blur-sm select-none sticky left-0 z-30">
                        {HOURS.map(hour => (
                            <div key={hour} className="text-xs font-medium text-slate-400 relative h-full group" style={{ height: `${ROW_HEIGHT}px` }}>
                                <span className="absolute -top-2.5 right-3 bg-white px-1 group-hover:text-slate-600 transition-colors">
                                    {format(setHours(new Date(), hour), 'h a')}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Day Columns */}
                    {DAYS.map(dayOffset => {
                        const currentDayDate = addDays(weekStart, dayOffset);

                        const dayShifts = shifts.filter(s =>
                            isSameDay(s.start, currentDayDate)
                        );

                        return (
                            <div key={dayOffset} className="flex-1 border-r border-slate-100 relative group select-none z-10">
                                {/* Interaction Layer */}
                                {HOURS.map(hour => (
                                    <div
                                        key={hour}
                                        className={cn(
                                            "transition-colors h-full",
                                            !readOnly && "hover:bg-blue-50/30 cursor-crosshair"
                                        )}
                                        style={{ height: `${ROW_HEIGHT}px` }}
                                        onDragOver={(e) => { if (!readOnly) handleDragOver(e); }}
                                        onDrop={(e) => { if (!readOnly) handleDrop(e, dayOffset, hour); }}
                                        onMouseDown={(e) => { if (!readOnly) handleMouseDown(dayOffset, hour, e); }}
                                        onMouseEnter={() => { if (!readOnly) handleMouseEnter(dayOffset, hour); }}
                                    ></div>
                                ))}

                                {renderSelectionBox(dayOffset)}

                                {dayShifts.map(shift => {
                                    const startHour = shift.start.getHours() + shift.start.getMinutes() / 60;
                                    const durationHours = differenceInMinutes(shift.end, shift.start) / 60;

                                    const topOffset = (startHour - START_HOUR) * ROW_HEIGHT;
                                    const height = durationHours * ROW_HEIGHT;

                                    const employee = employees.find(e => e.id === shift.employeeId);

                                    return (
                                        <div
                                            key={shift.id}
                                            style={{
                                                position: 'absolute',
                                                top: `${Math.max(0, topOffset)}px`,
                                                height: `${Math.max(34, height)}px`, // Ensure min height for readability
                                                left: '4px',
                                                right: '4px',
                                                zIndex: 10
                                            }}
                                        >
                                            <ShiftCard
                                                shift={shift}
                                                employee={employee}
                                                onClick={() => onShiftClick(shift)}
                                                onDragStart={(e) => handleDragStartShift(e, shift.id)}
                                                readOnly={readOnly}
                                            />
                                        </div>
                                    );
                                })}

                                {/* Current Time Indicator (if today) */}
                                {isSameDay(currentDayDate, new Date()) && (
                                    <div
                                        className="absolute left-0 right-0 border-t-2 border-red-500 z-20 pointer-events-none shadow-sm"
                                        style={{
                                            top: `${((new Date().getHours() + new Date().getMinutes() / 60) - START_HOUR) * ROW_HEIGHT}px`
                                        }}
                                    >
                                        <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
                                        <div className="absolute left-0 -top-6 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                            {format(new Date(), 'h:mm a')}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CalendarGrid;
