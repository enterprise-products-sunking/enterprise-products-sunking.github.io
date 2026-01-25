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
                <div className="flex items-center gap-4 py-1">
                    <Avatar className="h-10 w-10 border border-slate-200">
                        <AvatarImage src={employee.avatar} />
                        <AvatarFallback className={`bg-${employee.color}-100 text-${employee.color}-600 font-medium`}>
                            {employee.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 text-sm">{employee.name}</span>
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{row.original.phone}</span>
                </div>
            )
        },
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{row.original.email}</span>
                </div>
            )
        },
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
            const employee = row.original
            return (
                <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    {employee.role}
                </div>
            )
        },
    },
    {
        id: "actions",
        header: "Action",
        cell: ({ row }) => {
            const employee = row.original

            return (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 data-[state=open]:bg-slate-100 rounded-lg">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4 text-slate-500" />
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
