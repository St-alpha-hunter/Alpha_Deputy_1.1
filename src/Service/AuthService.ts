import axios from "axios";
import { handleError } from "../Helpers/ErrorHandler";
import  type { UserProfileToken } from "../Models/User";

const apiBase = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");
const api = `${apiBase}/`;
console.log('VITE_API_BASE:', import.meta.env.VITE_API_BASE);


export const loginAPI = async (username: string, password: string) => {
  try {
    const data = await axios.post<UserProfileToken>(api + "api/account/login", {
      username: username,
      password: password,
    });
    return data;
  } catch (error) {
      console.error("API ERROR:", error); 
      handleError(error);
      throw error;
  }
};

export const registerAPI = async (
  email: string,
  username: string,
  password: string
) => {
  try {
    const data = await axios.post<UserProfileToken>(api + "api/account/register", {
      EmailAddress: email,
      Username: username,
      Password: password,
    });
    return data;
  } catch (error) {
    console.error("API ERROR:", error); 
    handleError(error);
    throw error;
  }
};
