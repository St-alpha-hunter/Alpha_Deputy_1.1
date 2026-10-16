import { toast } from "react-toastify";
import axios from "axios";
import type { AxiosError } from "axios";
import i18n from "../i18n";




export const handleError = (error: any) => {
  if (axios.isAxiosError(error)) {
    var err = error.response;
    if (err?.status == 401) {
      // [401 处理 2026-10-16] 原来这里 toast("Please login") + window.history.pushState 跳登录页：
      // pushState 只改地址栏，React Router 不会切换页面，token 也没清。
      // 现在“登录过期”的 401 统一由 useAuth.tsx 里的 axios 全局拦截器处理（清 token + 真正跳转 + 只提示一次），
      // 这里不再重复处理。唯一例外是登录/注册接口：它们的 401 表示用户名或密码错误，要把后端返回的原因告诉用户
      if (error.config?.url?.includes("/api/account/")) {
        toast.warning(typeof err.data === "string" && err.data ? err.data : i18n.t("auth.loginFailed"));
      }
    } else if (Array.isArray(err?.data.errors)) {
      for (let val of err?.data.errors) {
        toast.warning(val.description);
      }
    } else if (typeof err?.data.errors === "object") {
      for (let e in err?.data.errors) {
        toast.warning(err.data.errors[e][0]);
      }
    } else if (err?.data) {
      toast.warning(err.data);
    } else if (err) {
      toast.warning(err?.data);
    }
  }
};