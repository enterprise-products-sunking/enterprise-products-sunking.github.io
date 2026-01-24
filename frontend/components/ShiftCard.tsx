"use client";

import React from 'react';
import { Shift, Employee, ShiftStatus } from '../types';
import { format } from 'date-fns';
import { MoreHorizontal, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { cn } from "@/lib/utils"; // using shadcn utility

interface ShiftCardProps {
    shift: Shift;
    employee?: Employee;
    onClick: () => void;
    onDragStart: (e: React.DragEvent) => void;
    readOnly?: boolean;
}

const ShiftCard: React.FC<ShiftCardProps> = ({ shift, employee, onClick, onDragStart, readOnly }) => {
    const isUnassigned = !shift.employeeId;

    let colorClasses = "bg-white border-slate-200 text-slate-700";

    if (isUnassigned) {
        colorClasses = "bg-slate-50 border-dashed border-slate-300 text-slate-500";
    } else if (shift.status === ShiftStatus.Pending) {
        colorClasses = "bg-amber-50 border-amber-200 text-amber-800";
    } else if (employee) {
        const colorMap: Record<string, string> = {
            blue: 'bg-blue-50 border-blue-200 text-blue-900',
            emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
            purple: 'bg-purple-50 border-purple-200 text-purple-900',
            orange: 'bg-orange-50 border-orange-200 text-orange-900',
            pink: 'bg-pink-50 border-pink-200 text-pink-900',
        };
        colorClasses = colorMap[employee.color] || 'bg-slate-100 border-slate-200 text-slate-900';
    }

    const StatusIcon = () => {
        if (isUnassigned) return <AlertTriangle className="w-3 h-3 text-red-400" />;
        if (shift.status === ShiftStatus.Confirmed) return <CheckCircle className="w-3 h-3 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />;
        if (shift.status === ShiftStatus.Pending) return <Clock className="w-3 h-3 text-amber-500" />;
        return null;
    };

    return (
        <div
            draggable={!readOnly}
            onDragStart={(e) => { if (!readOnly) onDragStart(e); }}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={cn(
                "relative rounded-md p-1.5 text-xs font-medium border shadow-sm transition-all group overflow-hidden h-full flex flex-col select-none",
                !readOnly && "cursor-pointer hover:ring-2 hover:ring-offset-1 active:cursor-grabbing",
                readOnly && "cursor-default",
                colorClasses
            )}
        >
            <div className="flex justify-between items-start gap-1">
                <span className="truncate font-bold text-[10px] leading-tight">
                    {format(shift.start, 'h:mm a')} - {format(shift.end, 'h:mm a')}
                </span>
                <StatusIcon />
            </div>

            <div className="mt-0.5 flex-1 min-h-0 flex flex-col justify-center">
                {isUnassigned ? (
                    <span className="italic text-slate-500 text-[10px] truncate">Open</span>
                ) : (
                    <div className="flex items-center gap-1.5 min-w-0">
                        {employee?.avatar && (
                            <img src={employee.avatar} alt="" className="w-4 h-4 rounded-full flex-shrink-0" />
                        )}
                        <span className="truncate text-[10px] font-semibold">{employee?.name}</span>
                    </div>
                )}
                {/* Role only visible if enough height, crudely handled by flex */}
                <div className="text-[9px] opacity-75 truncate uppercase tracking-wide hidden sm:block mt-0.5">
                    {shift.role}
                </div>
            </div>

            <button className="absolute bottom-0.5 right-0.5 opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-black/10 transition-all">
                <MoreHorizontal className="w-3 h-3" />
            </button>
        </div>
    );
};

export default ShiftCard;
