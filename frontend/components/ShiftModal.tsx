"use client";

import React, { useState, useEffect } from 'react';
import { Shift, Employee, ShiftStatus, UserRole } from '../types';
import { format, differenceInMinutes } from 'date-fns';
import { X, User, Trash2, Clock, Check, Plus, Layers, Divide } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface ShiftModalProps {
    shift: Partial<Shift> | null;
    employees: Employee[];
    isOpen: boolean;
    onClose: () => void;
    onSave: (shift: Partial<Shift> | Partial<Shift>[]) => void;
    onDelete: (id: string) => void;
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
    userRole?: UserRole | null;
}

const ShiftModal: React.FC<ShiftModalProps> = ({
    shift,
    employees,
    isOpen,
    onClose,
    onSave,
    onDelete,
    onApprove,
    onReject,
    userRole
}) => {
    const [formData, setFormData] = useState<Partial<Shift>>({});
    const [shiftQueue, setShiftQueue] = useState<Partial<Shift>[]>([]);

    // Split Mode State
    const [mode, setMode] = useState<'single' | 'split'>('single');
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);

    // Derived logic
    const isEditing = !!formData.id;
    const isAdmin = userRole === UserRole.Admin;
    const isMember = userRole === UserRole.Employee;
    const canEdit = isAdmin;

    useEffect(() => {
        if (shift) {
            setFormData(shift);
            setShiftQueue([]); // Reset queue when opening
            setMode('single'); // Reset mode
            setSelectedEmployeeIds([]); // Reset selection
        }
    }, [shift, isOpen]);

    const toggleEmployeeSelection = (empId: string) => {
        setSelectedEmployeeIds(prev =>
            prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
        );
    };

    const getSplitDurationLabel = () => {
        if (!formData.start || !formData.end || selectedEmployeeIds.length === 0) return null;
        const totalMinutes = differenceInMinutes(formData.end, formData.start);
        const minsPerPerson = Math.floor(totalMinutes / selectedEmployeeIds.length);
        const hours = Math.floor(minsPerPerson / 60);
        const mins = minsPerPerson % 60;
        return `${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}m` : ''}`;
    };

    const generateSplitShifts = (): Partial<Shift>[] => {
        if (!formData.start || !formData.end || selectedEmployeeIds.length === 0) return [];

        const startTime = formData.start.getTime();
        const endTime = formData.end.getTime();
        const totalDuration = endTime - startTime;
        const durationPerShift = totalDuration / selectedEmployeeIds.length;

        return selectedEmployeeIds.map((empId, index) => {
            const s = new Date(startTime + (durationPerShift * index));
            const e = new Date(s.getTime() + durationPerShift);

            return {
                ...formData,
                employeeId: empId,
                start: s,
                end: e,
            };
        });
    };

    const handleAddToQueue = () => {
        if (!formData.start || !formData.end) return;

        if (mode === 'split') {
            const splits = generateSplitShifts();
            setShiftQueue(prev => [...prev, ...splits]);
            setSelectedEmployeeIds([]);
        } else {
            setShiftQueue(prev => [...prev, { ...formData }]);
            setFormData(prev => ({ ...prev, employeeId: null }));
        }
    };

    const handleRemoveFromQueue = (index: number) => {
        setShiftQueue(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();

        if (isEditing) {
            // Single edit mode
            onSave(formData);
        } else {
            let finalShifts = [...shiftQueue];

            // Add currently active form data if valid
            if (mode === 'split') {
                if (selectedEmployeeIds.length > 0) {
                    finalShifts = [...finalShifts, ...generateSplitShifts()];
                }
            } else {
                // In single mode, save the current form state
                finalShifts.push(formData);
            }

            if (finalShifts.length > 0) {
                onSave(finalShifts);
            }
        }
        // onClose handled by parent usually but here we assume done.
    };

    const handleTimeChange = (type: 'start' | 'end', timeStr: string) => {
        if (!formData.start) return;

        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date(type === 'start' ? formData.start : (formData.end || formData.start));
        date.setHours(hours, minutes);

        setFormData(prev => ({
            ...prev,
            [type]: date
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <DialogTitle>{isEditing ? 'Edit Shift' : (mode === 'split' ? 'Split Shift' : 'New Shift')}</DialogTitle>
                    <DialogDescription className="hidden">Shift details</DialogDescription>
                    {!isEditing && shiftQueue.length > 0 && (
                        <span className="text-xs text-blue-600 font-medium">{shiftQueue.length} shifts in queue</span>
                    )}
                </DialogHeader>

                {!isEditing && isAdmin && (
                    <div className="px-6 pt-4">
                        <Tabs value={mode} onValueChange={(v) => setMode(v as 'single' | 'split')} className="w-full">
                            <TabsList className="w-full grid grid-cols-2">
                                <TabsTrigger value="single">Single Assignment</TabsTrigger>
                                <TabsTrigger value="split">Split Time</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                )}

                <ScrollArea className="flex-1 px-6 py-4">
                    <div className="space-y-4">
                        {/* Assignment Status Actions */}
                        {isEditing && (formData.status === ShiftStatus.PendingConfirmation || formData.status === ShiftStatus.Pending) && (
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex flex-col gap-3 mb-2 shadow-sm animate-in fade-in slide-in-from-top-1">
                                <div className="flex items-start gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                        <Check className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-amber-900 leading-tight">Action Required</p>
                                        <p className="text-xs text-amber-700 mt-0.5">This shift is pending validation. Approve it to add it to your schedule.</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-9"
                                        onClick={() => onReject?.(formData.id!)}
                                    >
                                        Reject
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm h-9"
                                        onClick={() => onApprove?.(formData.id!)}
                                    >
                                        Approve
                                    </Button>
                                </div>
                            </div>
                        )}
                        {/* Employee Selection */}
                        <div className="space-y-2">
                            <Label className="uppercase text-xs text-slate-500 font-bold flex justify-between">
                                Employee{mode === 'split' ? 's' : ''}
                                {mode === 'split' && selectedEmployeeIds.length > 0 && (
                                    <span className="text-blue-600 font-medium text-[10px]">{selectedEmployeeIds.length} Selected</span>
                                )}
                            </Label>

                            {!canEdit ? (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                        {(employees.find(e => e.id === formData.employeeId)?.name || formData.assignedUser?.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">
                                            {employees.find(e => e.id === formData.employeeId)?.name || formData.assignedUser?.name || (formData.employeeId ? 'Assigned' : 'Unassigned')}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {employees.find(e => e.id === formData.employeeId)?.role || (formData.employeeId ? 'Staff' : 'Open Shift')}
                                        </p>
                                    </div>
                                </div>
                            ) : mode === 'single' ? (
                                <Select
                                    value={formData.employeeId || "open"}
                                    onValueChange={(val) => setFormData({ ...formData, employeeId: val === "open" ? null : val })}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="-- Open Shift --" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="open">-- Open Shift --</SelectItem>
                                        {employees.map(emp => (
                                            <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="border border-slate-200 rounded-lg max-h-[150px] overflow-y-auto bg-slate-50/50 p-1 space-y-1">
                                    {employees.map(emp => {
                                        const isSelected = selectedEmployeeIds.includes(emp.id);
                                        return (
                                            <div
                                                key={emp.id}
                                                onClick={() => toggleEmployeeSelection(emp.id)}
                                                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors text-sm ${isSelected ? 'bg-blue-100 text-blue-800' : 'hover:bg-slate-100 text-slate-700'}`}
                                            >
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                                <span className="flex-1 truncate">{emp.name}</span>
                                                <Badge variant="outline" className="text-[10px] h-5 px-1 font-normal text-slate-500 bg-white border-slate-200">{emp.role}</Badge>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {mode === 'split' && selectedEmployeeIds.length > 0 && (
                            <div className="bg-blue-50 text-blue-800 text-xs px-3 py-2 rounded-lg flex items-center gap-2 border border-blue-100">
                                <Clock className="w-3 h-3" />
                                <span>
                                    Splitting into <strong>{selectedEmployeeIds.length}</strong> shifts of <strong>{getSplitDurationLabel()}</strong> each.
                                </span>
                            </div>
                        )}

                        {/* Time Selection */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="uppercase text-xs text-slate-500 font-bold">Start Time</Label>
                                <div className="relative">
                                    <Input
                                        type="time"
                                        className="pl-9"
                                        value={formData.start ? format(formData.start, 'HH:mm') : ''}
                                        onChange={(e) => handleTimeChange('start', e.target.value)}
                                        required
                                        disabled={!canEdit}
                                    />
                                    <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="uppercase text-xs text-slate-500 font-bold">End Time</Label>
                                <div className="relative">
                                    <Input
                                        type="time"
                                        className="pl-9"
                                        value={formData.end ? format(formData.end, 'HH:mm') : ''}
                                        onChange={(e) => handleTimeChange('end', e.target.value)}
                                        required
                                        disabled={!canEdit}
                                    />
                                    <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                        </div>

                        {/* Role & Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="uppercase text-xs text-slate-500 font-bold">Role</Label>
                                <Input
                                    placeholder="e.g. Server"
                                    value={formData.role || ''}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    disabled={!canEdit}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="uppercase text-xs text-slate-500 font-bold">Status</Label>
                                <Select
                                    value={formData.status || ShiftStatus.Pending}
                                    onValueChange={(val) => setFormData({ ...formData, status: val as ShiftStatus })}
                                    disabled={!canEdit}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ShiftStatus.Confirmed}>Confirmed</SelectItem>
                                        <SelectItem value={ShiftStatus.Pending}>Pending</SelectItem>
                                        <SelectItem value={ShiftStatus.Open}>Open Request</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label className="uppercase text-xs text-slate-500 font-bold">Notes</Label>
                            <Textarea
                                placeholder="Add shift notes..."
                                className="min-h-[80px] resize-none"
                                value={formData.notes || ''}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                disabled={!canEdit}
                            />
                        </div>

                        {/* Queue List (Only show if not editing existing) */}
                        {!isEditing && shiftQueue.length > 0 && (
                            <div className="mt-4 border-t border-slate-100 pt-3">
                                <Label className="uppercase text-xs text-slate-500 font-bold mb-2">Shifts to Create ({shiftQueue.length})</Label>
                                <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1 mt-2">
                                    {shiftQueue.map((qShift, idx) => {
                                        const emp = employees.find(e => e.id === qShift.employeeId);
                                        return (
                                            <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded text-xs border border-slate-100">
                                                <div>
                                                    <span className="font-semibold text-slate-700">
                                                        {qShift.start && format(qShift.start, 'h:mm a')} - {qShift.end && format(qShift.end, 'h:mm a')}
                                                    </span>
                                                    <span className="text-slate-500 mx-1">•</span>
                                                    <span>{emp ? emp.name : 'Open Shift'}</span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 text-red-400 hover:text-red-600"
                                                    onClick={() => handleRemoveFromQueue(idx)}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between sm:justify-between w-full">
                    <div className="flex gap-2">
                        {isEditing && isAdmin ? (
                            <Button
                                variant="destructive"
                                type="button"
                                onClick={() => onDelete(formData.id!)}
                                className="gap-2"
                            >
                                <Trash2 className="w-4 h-4" /> Delete
                            </Button>
                        ) : !isEditing && isAdmin ? (
                            <Button
                                variant="outline"
                                type="button"
                                onClick={handleAddToQueue}
                                className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                            >
                                <Layers className="w-4 h-4" /> {mode === 'split' ? 'Add Split Set' : 'Add Another'}
                            </Button>
                        ) : null}
                    </div>

                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={onClose}>{isAdmin ? 'Cancel' : 'Close'}</Button>
                        {isAdmin && (
                            <Button onClick={() => handleSubmit()} className="bg-blue-600 hover:bg-blue-700">
                                Save {isEditing ? 'Changes' : (mode === 'split' || shiftQueue.length > 0 ? 'All' : 'Shift')}
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ShiftModal;
