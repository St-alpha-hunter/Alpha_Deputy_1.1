import axios from "axios";
import { handleError } from "../Helpers/ErrorHandler";
import  type { UserProfileToken } from "../Models/User";

const api = "http://localhost:5213/api/";

export const loginAPI = async (username: string, password: string) => {
  try {
    const data = await axios.post<UserProfileToken>(api + "account/login", {
      username: username,
      password: password,
    });
    return data;
  } catch (error) {
    handleError(error);
  }
};

export const registerAPI = async (
  email: string,
  username: string,
  password: string
) => {
  try {
    const data = await axios.post<UserProfileToken>(api + "account/register", {
      EmailAddress: email,
      Username: username,
      Password: password,
    });
    return data;
  } catch (error) {
    handleError(error);
  }
};