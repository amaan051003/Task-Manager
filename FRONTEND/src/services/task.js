import API from "./api";

export const createTask = async (data) => {
    const res = await API.post("/tasks", data);
    return res.data;
};

// With filters: getTasks({ status: "pending", priority: "high", page: 1 })
export const getTasks = async (filters = {}) => {
    const res = await API.get("/tasks", { params: filters });
    return res.data;
};

export const getTask = async (id) => {
    const res = await API.get(`/tasks/${id}`);
    return res.data;
};

export const updateTask = async (id, data) => {
    const res = await API.put(`/tasks/${id}`, data);
    return res.data;
};

export const deleteTask = async (id) => {
    const res = await API.delete(`/tasks/${id}`);
    return res.data;
};

export const updateTaskStatus = async (id, status) => {
    const res = await API.patch(`/tasks/${id}/status`, { status });
    return res.data;
};

export const updateTaskProgress = async (id, progress) => {
    const res = await API.patch(`/tasks/${id}/progress`, { progress });
    return res.data;
};

// File upload
export const uploadTaskFile = async (id, files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const res = await API.post(`/tasks/${id}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

export const downloadTaskFile = async (taskId, file) => {
    const res = await API.get(`/tasks/${taskId}/files/${file._id}/download`, {
        responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", file.originalName || "task-file");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};
