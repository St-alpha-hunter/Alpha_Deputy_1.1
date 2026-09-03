import { toast } from "react-toastify";
import axios from "axios";


export const handleError = (error: any) => {
  if (!axios.isAxiosError(error)) {
    return;
  }

  const err = error.response;

  if (err?.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    if (window.location.pathname !== "/login") {
      toast.warning("Please login");
      window.location.assign("/login");
    }
    return;
  }

  if (Array.isArray(err?.data?.errors)) {
      for (const val of err.data.errors) {
        toast.warning(val.description);
      }
  } else if (err?.data?.errors && typeof err.data.errors === "object") {
      for (const e in err.data.errors) {
        toast.warning(err.data.errors[e][0]);
      }
  } else if (err?.data) {
      toast.warning(typeof err.data === "string" ? err.data : "Request failed");
  } else if (err) {
      toast.warning("Request failed");
  }
};
