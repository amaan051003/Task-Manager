import API from "./api";

export const createTeam = async (data) => {
    const res = await API.post("/teams", data);
    return res.data;
};

export const getTeams = async () => {
    const res = await API.get("/teams");
    return res.data;
};

export const getTeam = async (id) => {
    const res = await API.get(`/teams/${id}`);
    return res.data;
};

export const updateTeam = async (id, data) => {
    const res = await API.put(`/teams/${id}`, data);
    return res.data;
};

export const deleteTeam = async (id) => {
    const res = await API.delete(`/teams/${id}`);
    return res.data;
};

export const addMember = async (teamId, userId) => {
    const res = await API.post(`/teams/${teamId}/add-member`, { userId });
    return res.data;
};

export const removeMember = async (teamId, userId) => {
    const res = await API.post(`/teams/${teamId}/remove-member`, { userId });
    return res.data;
};