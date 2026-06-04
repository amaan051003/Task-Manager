import API from "./api";

// Register
export const register = async (data) => {
    const res = await API.post("/auth/register", data);
    return res.data;
};

// Login
export const login = async (data) => {
    const res = await API.post("/auth/login", data);
    // Save token to localStorage
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    return res.data;
};

// Logout
export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};

// Get current user
export const getMe = async () => {
    const res = await API.get("/auth/me");
    return res.data;
};

// Create account (manager only)
export const createAccount = async (data) => {
    const res = await API.post("/auth/create-account", data);
    return res.data;
};

// Backward-compatible helper for older manager flows.
export const createEmployee = async (data) => createAccount({ ...data, role: "employee" });
