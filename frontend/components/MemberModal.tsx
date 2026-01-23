"use client";

import React, { useState, useEffect } from 'react';
import { Employee } from '../types';
import { X, Check, Trash2, Mail, Phone, User, Briefcase, Hash } from 'lucide-react';
import { DEPARTMENTS } from '../constants';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface MemberModalProps {
    member: Partial<Employee> | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (member: Partial<Employee>) => void;
    onDelete?: (id: string) => void;
}

const MemberModal: React.FC<MemberModalProps> = ({ member, isOpen, onClose, onSave, onDelete }) => {
    const [formData, setFormData] = useState<Partial<Employee>>({});

    useEffect(() => {
        if (member) {
            setFormData(member);
        } else {
            setFormData({
                color: 'blue',
                weeklyHours: 0,
                maxHours: 40
            });
        }
    }, [member, isOpen]);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        onSave(formData);
        onClose();
    };

    const colors = ['blue', 'emerald', 'purple', 'orange', 'pink', 'red', 'cyan', 'indigo'];

    return (
        <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{formData.id ? 'Edit Member' : 'Add New Member'}</DialogTitle>
                    <DialogDescription className="hidden">Employee details</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="flex gap-6">
                        {/* Avatar / Color */}
                        <div className="flex-shrink-0 flex flex-col items-center gap-3">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold bg-${formData.color}-500 shadow-md ring-4 ring-slate-50`}>
                                {formData.name ? formData.name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
                            </div>
                            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-50 rounded-lg border border-slate-100">
                                {colors.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, color: c })}
                                        className={`w-4 h-4 rounded-full bg-${c}-500 transition-all ${formData.color === c ? 'scale-125 ring-2 ring-offset-1 ring-slate-400 z-10' : 'hover:scale-110'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 space-y-4">
                            <div className="space-y-2">
                                <Label className="uppercase text-xs text-slate-500 font-bold">Full Name</Label>
                                <Input
                                    required
                                    placeholder="e.g. Jane Doe"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="uppercase text-xs text-slate-500 font-bold">Email Address</Label>
                                <div className="relative">
                                    <Input
                                        type="email"
                                        required
                                        className="pl-9"
                                        placeholder="name@example.com"
                                        value={formData.email || ''}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="uppercase text-xs text-slate-500 font-bold">Phone Number</Label>
                            <div className="relative">
                                <Input
                                    type="tel"
                                    required
                                    className="pl-9"
                                    placeholder="(555) 123-4567"
                                    value={formData.phone || ''}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="uppercase text-xs text-slate-500 font-bold">Role</Label>
                            <div className="relative">
                                <Input
                                    type="text"
                                    required
                                    className="pl-9"
                                    placeholder="e.g. Server"
                                    value={formData.role || ''}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                />
                                <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="uppercase text-xs text-slate-500 font-bold">Department</Label>
                            <Select
                                value={formData.department || ''}
                                onValueChange={(val) => setFormData({ ...formData, department: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Dept" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="uppercase text-xs text-slate-500 font-bold">Max Hours</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    min="0"
                                    max="168"
                                    className="pl-9"
                                    value={formData.maxHours || 40}
                                    onChange={(e) => setFormData({ ...formData, maxHours: parseInt(e.target.value) })}
                                />
                                <Hash className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex items-center justify-between sm:justify-between w-full pt-4 border-t border-slate-100">
                        <div className="flex gap-2">
                            {formData.id && onDelete && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => onDelete(formData.id!)}
                                    className="gap-2"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete
                                </Button>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save Member</Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default MemberModal;
