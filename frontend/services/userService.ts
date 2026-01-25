import { apiRequest } from "@/lib/api-client";
import { Employee } from "@/types";

export interface UserResponse {
    user_id: string;
    email: string;
    role: string;
    full_name: string | null;
    phone_number: string | null;
    isd_code: string | null;
}

const mapUserToEmployee = (user: UserResponse): Employee => {
    return {
        id: user.user_id,
        name: user.full_name || user.email.split('@')[0],
        email: user.email,
        phone: user.phone_number || "N/A",
        isd_code: user.isd_code || "234",
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
    },

    updateUser: async (userId: string, data: {
        full_name?: string;
        phone_number?: string;
        isd_code?: string;
    }) => {
        return await apiRequest(`/users/${userId}`, {
            method: "PATCH",
            body: JSON.stringify(data)
        });
    },

    createUser: async (data: {
        email: string;
        phone_number: string;
        full_name?: string;
        role?: 'admin' | 'member';
        isd_code?: string;
    }) => {
        return await apiRequest("/users", {
            method: "POST",
            body: JSON.stringify(data)
        });
    },

    deleteUser: async (userId: string) => {
        return await apiRequest(`/users/${userId}`, {
            method: "DELETE"
        });
    }
};
