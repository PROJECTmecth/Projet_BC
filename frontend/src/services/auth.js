import api from "../lib/axios";

export const loginRequest = ({ name, password }) =>
  api.post("/api/login", { name, password });

export const logoutRequest = () =>
  api.post("/api/logout");

export const getUser = () =>
  api.get("/api/user");

export const verifyToken = async () => {
  try {
    const response = await getUser();
    return { valid: true, user: response.data };
  } catch (error) {
    return { valid: false, error };
  }
};