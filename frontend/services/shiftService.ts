import { apiRequest } from "@/lib/api-client";
import { Shift, ShiftStatus } from "@/types";
import { parseISO } from "date-fns";

export interface ShiftResponse {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    is_open: boolean;
    notes: string | null;
    google_calendar_event_id: string | null;
}

export interface AssignmentResponse {
    id: string;
    shift_id: string;
    user_id: string;
    status: "confirmed" | "pending_confirmation" | "rejected";
    shift: ShiftResponse;
    user: {
        id: string;
        full_name: string;
        email: string;
    } | null;
}

const mapAssignmentToShift = (assignment: AssignmentResponse): Shift => {
    let status: ShiftStatus = ShiftStatus.Pending;

    if (assignment.status === "confirmed") {
        status = ShiftStatus.Confirmed;
    } else if (assignment.status === "pending_confirmation") {
        status = ShiftStatus.PendingConfirmation;
    }

    return {
        id: assignment.id, // Use the Assignment ID as the primary unique ID
        assignmentId: assignment.id,
        employeeId: assignment.user_id,
        assignedUser: assignment.user ? {
            id: assignment.user.id,
            name: assignment.user.full_name,
            email: assignment.user.email
        } : undefined,
        start: parseISO(assignment.shift.start_time),
        end: parseISO(assignment.shift.end_time),
        role: assignment.shift.title,
        status: status,
        rawStatus: assignment.status,
        notes: assignment.shift.notes || undefined,
    };
};

export const shiftService = {
    listAllShifts: async (): Promise<Shift[]> => {
        const response = await apiRequest<AssignmentResponse[]>("/shifts");
        return (response.data || []).map(mapAssignmentToShift);
    },

    listMyShifts: async (): Promise<Shift[]> => {
        const response = await apiRequest<AssignmentResponse[]>("/my-shifts");
        return (response.data || []).map(mapAssignmentToShift);
    },

    approveShift: async (shiftId: string) => {
        return await apiRequest(`/shifts/${shiftId}/approve`, {
            method: "POST"
        });
    },

    rejectShift: async (shiftId: string) => {
        return await apiRequest(`/shifts/${shiftId}/reject`, {
            method: "POST"
        });
    },

    // Marketplace & Swaps
    listMarketplace: async (): Promise<any[]> => {
        const response = await apiRequest<any[]>("/marketplace");
        return response.data || [];
    },

    createSwap: async (data: { offered_shift_assignment_id: string; target_shift_assignment_id?: string; note?: string }) => {
        return await apiRequest("/swaps/create", {
            method: "POST",
            body: JSON.stringify(data)
        });
    },

    proposeSwap: async (swapId: string, targetAssignmentId: string) => {
        return await apiRequest(`/swaps/${swapId}/propose`, {
            method: "POST",
            body: JSON.stringify({ target_shift_assignment_id: targetAssignmentId })
        });
    }
};
