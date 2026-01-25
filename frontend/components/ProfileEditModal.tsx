"use client";

import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone } from 'lucide-react';
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
import { toast } from 'sonner';

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: {
        id: string;
        name: string;
        email: string;
        phone?: string;
    } | null;
    onProfileUpdated: () => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
    isOpen,
    onClose,
    currentUser,
    onProfileUpdated
}) => {
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isdCode, setIsdCode] = useState('+1');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setFullName(currentUser.name || '');
            setPhoneNumber(currentUser.phone || '');
        }
    }, [currentUser, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser?.id) {
            toast.error("User ID not found");
            return;
        }

        setIsSubmitting(true);

        try {
            const { userService } = await import('@/services/userService');

            await userService.updateUser(currentUser.id, {
                full_name: fullName,
                phone_number: phoneNumber || undefined,
                isd_code: isdCode.replace('+', '') || undefined
            });

            toast.success('Profile updated successfully!');
            onProfileUpdated();
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Update your personal information
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-sm font-medium">
                            Full Name
                        </Label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    {/* Email (Read-only) */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                            Email
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                id="email"
                                type="email"
                                value={currentUser?.email || ''}
                                className="pl-10 bg-slate-50"
                                disabled
                            />
                        </div>
                        <p className="text-xs text-slate-500">Email cannot be changed</p>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium">
                            Phone Number
                        </Label>
                        <div className="flex gap-2">
                            <div className="relative w-24">
                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="+1"
                                    value={isdCode}
                                    onChange={(e) => setIsdCode(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="1234567890"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="flex-1"
                            />
                        </div>
                    </div>
                </form>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ProfileEditModal;
