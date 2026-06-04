import API from "./api";

export const getNotifications = async (unread = false) => {
    const res = await API.get("/notifications", { params: { unread } });
    return res.data;
};

export const markAsRead = async (id) => {
    const res = await API.patch(`/notifications/${id}/read`);
    return res.data;
};

export const markAllAsRead = async () => {
    const res = await API.patch("/notifications/read-all");
    return res.data;
};