"use client";

import React, { useState, useEffect } from 'react';
import { Employee } from '../types';
import { Trash2, Mail, Phone, User, Briefcase } from 'lucide-react';
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

const ISD_CODES = [
    { country: 'Benin', code: '229', flag: '🇧🇯' },
    { country: 'Nigeria', code: '234', flag: '🇳🇬' },
    { country: 'Kenya', code: '254', flag: '🇰🇪' },
    { country: 'Zambia', code: '260', flag: '🇿🇲' },
    { country: 'India', code: '91', flag: '🇮🇳' },
];

const MemberModal: React.FC<MemberModalProps> = ({ member, isOpen, onClose, onSave, onDelete }) => {
    const [formData, setFormData] = useState<Partial<Employee>>({});

    useEffect(() => {
        if (member) {
            setFormData(member);
        } else {
            setFormData({
                weeklyHours: 0,
                isd_code: '234' // Default to Nigeria
            });
        }
    }, [member, isOpen]);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{formData.id ? 'Edit Member' : 'Add New Member'}</DialogTitle>
                    <DialogDescription className="hidden">Employee details</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="flex gap-6 items-center border-b border-slate-100 pb-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold bg-blue-600 shadow-lg ring-4 ring-blue-50">
                                {formData.name ? formData.name.charAt(0).toUpperCase() : <User className="w-10 h-10" />}
                            </div>
                        </div>

                        <div className="flex-1 space-y-4">
                            <div className="space-y-2">
                                <Label className="uppercase text-xs text-slate-500 font-bold tracking-wider">Full Name</Label>
                                <Input
                                    required
                                    placeholder="e.g. Jane Doe"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="uppercase text-xs text-slate-500 font-bold tracking-wider">Email Address</Label>
                                <div className="relative">
                                    <Input
                                        type="email"
                                        required
                                        className="pl-10"
                                        placeholder="name@example.com"
                                        value={formData.email || ''}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="uppercase text-xs text-slate-500 font-bold tracking-wider">Country / Code</Label>
                            <Select
                                value={formData.isd_code || '234'}
                                onValueChange={(val) => setFormData({ ...formData, isd_code: val })}
                            >
                                <SelectTrigger className="bg-slate-50 border-slate-200">
                                    <SelectValue placeholder="Code" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ISD_CODES.map(c => (
                                        <SelectItem key={c.code} value={c.code}>
                                            <span className="flex items-center gap-2">
                                                <span className="text-lg">{c.flag}</span>
                                                <span className="font-medium">+{c.code}</span>
                                                <span className="text-slate-400 text-xs">({c.country})</span>
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="uppercase text-xs text-slate-500 font-bold tracking-wider">Phone Number</Label>
                            <div className="relative">
                                <Input
                                    type="tel"
                                    required
                                    className="pl-10"
                                    placeholder="123 456 7890"
                                    value={formData.phone || ''}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                                <Phone className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="uppercase text-xs text-slate-500 font-bold tracking-wider">Role / Position</Label>
                        <Select
                            value={formData.role || 'member'}
                            onValueChange={(val) => setFormData({ ...formData, role: val })}
                        >
                            <SelectTrigger className="bg-slate-50 border-slate-200">
                                <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="member">Member</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter className="flex items-center justify-between sm:justify-between w-full pt-6 border-t border-slate-100">
                        <div className="flex gap-2">
                            {formData.id && onDelete && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => onDelete(formData.id!)}
                                    className="gap-2 px-4"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete
                                </Button>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button type="button" variant="ghost" onClick={onClose} className="px-6">Cancel</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-8 shadow-lg shadow-blue-500/20">
                                {formData.id ? 'Save Changes' : 'Add Member'}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default MemberModal;
