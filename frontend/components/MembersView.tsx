"use client";

import React from 'react';
import { Employee } from '../types';
import { UserPlus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DataTable } from './DataTable';
import { getColumns } from './members-columns';

interface MembersViewProps {
    employees: Employee[];
    onAddMember: () => void;
    onEditMember: (employee: Employee) => void;
}

const MembersView: React.FC<MembersViewProps> = ({ employees, onAddMember, onEditMember }) => {
    // Column definitions with handlers
    const columns = getColumns({
        onEdit: onEditMember,
        onDelete: (employee) => {
            console.log('Delete employee:', employee.id);
            // In a real app, this would trigger a delete confirmation/action
        }
    });

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team Members</h1>
                        <p className="text-sm text-slate-500 mt-1">Manage your staff details, roles, and system access</p>
                    </div>
                    <Button
                        onClick={onAddMember}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Member
                    </Button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1">
                    <DataTable
                        columns={columns}
                        data={employees}
                        searchKey="name"
                    />
                </div>
            </div>
        </div>
    );
};

export default MembersView;
