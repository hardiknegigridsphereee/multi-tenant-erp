import apiClient from './apiClient';

// ─────────────────────────────────────────────────────────────────────────────
// Teacher Leave Management API
// All endpoints from leave_management/urls.py (teacher-facing subset)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch the teacher's own leave history.
 * GET /leave-management/leave-requests/me/?status=<optional>
 */
export const getMyLeaveRequests = async (status = "") => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    const response = await apiClient.get(`/leave-management/leave-requests/me/?${params.toString()}`);
    return response.data;
};

/**
 * Fetch pending student leave requests in the teacher's homeroom section.
 * GET /leave-management/leave-requests/pending-review/
 */
export const getPendingStudentReviews = async () => {
    const response = await apiClient.get("/leave-management/leave-requests/pending-review/");
    return response.data;
};

/**
 * Submit a new leave request (teacher applying for their own leave).
 * POST /leave-management/leave-requests/
 * Body: { leave_type, start_date, end_date, reason, attachment? }
 */
export const applyForLeave = async (data) => {
    // If attachment is a File object, send as multipart; otherwise JSON.
    if (data.attachment instanceof File) {
        const form = new FormData();
        Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== null) form.append(k, v); });
        const response = await apiClient.post("/leave-management/leave-requests/", form, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    }
    const payload = { ...data };
    delete payload.attachment;
    const response = await apiClient.post("/leave-management/leave-requests/", payload);
    return response.data;
};

/**
 * Cancel the teacher's own pending leave request.
 * POST /leave-management/leave-requests/{id}/cancel/
 */
export const cancelMyLeaveRequest = async (id) => {
    const response = await apiClient.post(`/leave-management/leave-requests/${id}/cancel/`, {});
    return response.data;
};

/**
 * Approve a homeroom student's leave request.
 * POST /leave-management/leave-requests/{id}/approve/
 */
export const approveStudentLeave = async (id, remarks = "") => {
    const response = await apiClient.post(`/leave-management/leave-requests/${id}/approve/`, { remarks });
    return response.data;
};

/**
 * Reject a homeroom student's leave request.
 * POST /leave-management/leave-requests/{id}/reject/
 */
export const rejectStudentLeave = async (id, remarks = "") => {
    const response = await apiClient.post(`/leave-management/leave-requests/${id}/reject/`, { remarks });
    return response.data;
};

// Bundled export
export const teacherLeaveApi = {
    getMyLeaveRequests,
    getPendingStudentReviews,
    applyForLeave,
    cancelMyLeaveRequest,
    approveStudentLeave,
    rejectStudentLeave,
};