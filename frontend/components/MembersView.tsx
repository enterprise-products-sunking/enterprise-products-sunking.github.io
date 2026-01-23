"use client";

import React from 'react';
import { Employee, UserRole } from '../types';
import { UserPlus, Mail, Phone, Briefcase, Clock, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface MembersViewProps {
    employees: Employee[];
    onAddMember: () => void;
    onEditMember: (employee: Employee) => void;
}

const MembersView: React.FC<MembersViewProps> = ({ employees, onAddMember, onEditMember }) => {
    return (
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Team Members</h1>
                        <p className="text-slate-500">Manage your staff details and roles</p>
                    </div>
                    <Button onClick={onAddMember} className="bg-blue-600 hover:bg-blue-700">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Member
                    </Button>
                </div>

                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 hover:bg-slate-50">
                                <TableHead className="w-[300px]">Employee</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Role & Dept</TableHead>
                                <TableHead>Availability</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.map((employee) => (
                                <TableRow key={employee.id} className="group">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-slate-200">
                                                <AvatarImage src={employee.avatar} />
                                                <AvatarFallback className={`bg-${employee.color}-100 text-${employee.color}-600`}>
                                                    {employee.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-semibold text-slate-900">{employee.name}</div>
                                                <div className="text-xs text-slate-500 font-mono">ID: {employee.id.slice(0, 8)}...</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                {employee.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                {employee.phone}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                                                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                                {employee.role}
                                            </div>
                                            <Badge variant="secondary" className="font-normal text-slate-600 bg-slate-100 hover:bg-slate-200">
                                                {employee.department}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                            <span>Max {employee.maxHours}h / week</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEditMember(employee)}>
                                                    Edit details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => onEditMember(employee)}>
                                                    Remove member
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {employees.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                                        No members found. Add your first employee!
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    );
};

export default MembersView;
