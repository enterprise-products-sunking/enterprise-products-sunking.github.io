"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Mail, Phone, Briefcase, Clock } from "lucide-react"
import { Employee } from "../types"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export type MemberColumnsProps = {
    onEdit: (employee: Employee) => void
    onDelete: (employee: Employee) => void
}

export const getColumns = ({ onEdit, onDelete }: MemberColumnsProps): ColumnDef<Employee>[] => [
    {
        accessorKey: "name",
        header: "Employee",
        cell: ({ row }) => {
            const employee = row.original
            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-slate-200">
                        <AvatarImage src={employee.avatar} />
                        <AvatarFallback className={`bg-${employee.color}-100 text-${employee.color}-600`}>
                            {employee.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{employee.name}</span>
                        <span className="text-xs text-slate-500 font-mono">ID: {employee.id.slice(0, 8)}...</span>
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "email",
        header: "Contact",
        cell: ({ row }) => {
            const employee = row.original
            return (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {employee.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {employee.phone}
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "role",
        header: "Role & Dept",
        cell: ({ row }) => {
            const employee = row.original
            return (
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        {employee.role}
                    </div>
                    <Badge variant="secondary" className="w-fit font-normal text-slate-600 bg-slate-100 hover:bg-slate-200">
                        {employee.department}
                    </Badge>
                </div>
            )
        },
    },
    {
        accessorKey: "maxHours",
        header: "Availability",
        cell: ({ row }) => {
            const hours = row.getValue("maxHours")
            return (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Max {hours as number}h / week</span>
                </div>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const employee = row.original

            return (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onEdit(employee)}>
                                Edit details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                onClick={() => onDelete(employee)}
                            >
                                Remove member
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
    },
]
