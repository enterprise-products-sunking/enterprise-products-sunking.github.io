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
        // bg-stripes-gray is custom, we'll simulate or just use a pattern if available, or just keeping it simple
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
                "relative rounded-md p-2 text-xs font-medium border shadow-sm transition-all group overflow-hidden h-full flex flex-col justify-between select-none",
                !readOnly && "cursor-pointer hover:ring-2 hover:ring-offset-1 active:cursor-grabbing",
                readOnly && "cursor-default",
                colorClasses
            )}
        >
            <div className="flex justify-between items-start">
                <span className="truncate font-bold">
                    {format(shift.start, 'h:mm a')} - {format(shift.end, 'h:mm a')}
                </span>
                <StatusIcon />
            </div>

            <div className="mt-1">
                {isUnassigned ? (
                    <span className="italic text-slate-500">Open Shift</span>
                ) : (
                    <div className="flex items-center gap-1.5">
                        {employee?.avatar && (
                            <img src={employee.avatar} alt="" className="w-5 h-5 rounded-full" />
                        )}
                        <span className="truncate text-[10px]">{employee?.name}</span>
                    </div>
                )}
            </div>

            <div className="mt-1 text-[10px] opacity-75 truncate uppercase tracking-wide">
                {shift.role}
            </div>

            <button className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-black/10 transition-all">
                <MoreHorizontal className="w-3 h-3" />
            </button>
        </div>
    );
};

export default ShiftCard;
