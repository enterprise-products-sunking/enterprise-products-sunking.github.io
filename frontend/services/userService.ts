import { apiRequest } from "@/lib/api-client";
import { Employee } from "@/types";

export interface UserResponse {
    user_id: string;
    email: string;
    role: string;
    full_name: string | null;
    phone_number: string | null;
}

const mapUserToEmployee = (user: UserResponse): Employee => {
    return {
        id: user.user_id,
        name: user.full_name || user.email.split('@')[0],
        email: user.email,
        phone: user.phone_number || "N/A",
        role: user.role === 'admin' ? 'Admin' : 'Staff',
        avatar: "",
        color: user.role === 'admin' ? "bg-indigo-500" : "bg-blue-500",
        department: "Staff",
        weeklyHours: 0,
        maxHours: 40,
    };
};

export const userService = {
    listUsers: async (): Promise<Employee[]> => {
        const response = await apiRequest<UserResponse[]>("/users");
        return (response.data || []).map(mapUserToEmployee);
    },

    getMyProfile: async (): Promise<Employee> => {
        const response = await apiRequest<UserResponse>("/users/me");
        return mapUserToEmployee(response.data);
    }
};
