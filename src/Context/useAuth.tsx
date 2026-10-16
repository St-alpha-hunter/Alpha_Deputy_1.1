import { createContext, useEffect, useRef, useState } from "react";
import type { UserProfile } from "../Models/User";
import { useNavigate } from "react-router-dom";
import { loginAPI, registerAPI } from "../Service/AuthService";
import { useDispatch } from "react-redux";
import { setSessionId } from "../redux/features/auth/authSlice";
import { toast } from "react-toastify";
import React from "react";
import axios from "axios";
import i18n from "../i18n";

/**
 * [401 处理 2026-10-16] 判断 JWT 是否已过期。
 * JWT 由三段 base64url 组成（头.载荷.签名），载荷里的 exp 是过期时间（秒级 Unix 时间戳）。
 * 这里只读 exp、不校验签名（签名只有后端能校验），目的只是“明显过期的 token 就别再拿去用了”。
 * 解析失败也当作过期处理。
 */
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" && payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

// [401 处理 2026-10-16] 登录、注册接口返回 401 表示“用户名或密码错误”，不是“登录过期”，全局拦截器要放过它们
const isAuthEndpoint = (url?: string) => !!url && url.includes("/api/account/");

type UserContextType = {
  user: UserProfile | null;
  token: string | null;
  registerUser: (email: string, username: string, password: string) => void;
  loginUser: (username: string, password: string) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
};

type Props = { children: React.ReactNode };

const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider = ({ children }: Props) => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isReady, setIsReady] = useState(false);
  const dispatch = useDispatch();
  // [401 处理 2026-10-16] 页面上往往同时发出好几个请求，token 过期时会一起返回 401；
  // 用这个标记保证只提示一次、只跳转一次，重新登录成功后再复位
  const handling401 = useRef(false);

  // [401 处理 2026-10-16] 清除登录状态（localStorage、axios 默认请求头、React 状态）。logout 和 401 处理共用
  const clearSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    setToken(null);
  };

  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    // [401 处理 2026-10-16] 原来只要 localStorage 里有 token 就当作已登录，不管它过没过期，
    // 结果页面显示“已登录”、请求却全部 401。现在启动时先检查过期，过期的直接清掉，当作未登录
    if (user && token && !isTokenExpired(token)) {
      setUser(JSON.parse(user));
      setToken(token);
      axios.defaults.headers.common["Authorization"] = "Bearer " + token;
    } else if (user || token) {
      clearSession();
    }

    // [401 处理 2026-10-16] 全局响应拦截器：所有 axios 请求返回 401 时统一处理 ——
    // 清除登录状态，并用 React Router 真正跳转到登录页（原来 ErrorHandler 里用 window.history.pushState，
    // 只改了地址栏，React Router 不知道，页面不会切换；token 也没清，用户会卡在“看似登录、实际全 401”的状态）。
    // 拦截器在 children 渲染之前就装好了（下面 setIsReady(true) 之后才渲染 children），所以不会漏掉页面的第一批请求
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 401 &&
          !isAuthEndpoint(error.config?.url) &&
          !handling401.current
        ) {
          handling401.current = true;
          clearSession();
          toast.warning(i18n.t("auth.sessionExpired"));
          if (window.location.pathname !== "/login") {
            // 记下原来的页面，ProtectedRoute 也是这样传 from 的，方便以后登录后跳回去
            navigate("/login", { replace: true, state: { from: { pathname: window.location.pathname } } });
          }
        }
        // 继续把错误抛给原来的调用方，各页面自己的 catch / loading 状态照常工作
        return Promise.reject(error);
      }
    );

    setIsReady(true);
    return () => axios.interceptors.response.eject(interceptorId);
  }, []);

  const registerUser = async (
    email: string,
    username: string,
    password: string
  ) => {
    await registerAPI(email, username, password)
      .then((res) => {
        if (res) {
          localStorage.setItem("token", res?.data.token);
          const userObj = {
            userName: res?.data.userName,
            email: res?.data.email,
          };
          localStorage.setItem("user", JSON.stringify(userObj));
          setToken(res?.data.token!);
          setUser(userObj!);

          axios.defaults.headers.common["Authorization"] = "Bearer " + res?.data.token;
          handling401.current = false;   // [401 处理 2026-10-16] 重新登录成功，复位

          toast.success("Login Success!");
          navigate("/search");
        }
      })
      // [401 处理 2026-10-16] 原来这里再弹一次 "Server error occured"，和 handleError 的提示重复，
      // 还把后端返回的真实原因盖住了。错误提示统一交给 handleError（AuthService 里已经调用过）
      .catch(() => {});
  };

  const loginUser = async (username: string, password: string) => {
    await loginAPI(username, password)
      .then((res) => {
        if (res) {
          localStorage.setItem("token", res?.data.token);
          const userObj = {
            userName: res?.data.userName,
            email: res?.data.email,
          };
          localStorage.setItem("user", JSON.stringify(userObj));
          setToken(res?.data.token!);
          setUser(userObj!);
          // 关键：登录完成后立即给 axios 设置 JWT
          axios.defaults.headers.common["Authorization"] = "Bearer " + res?.data.token;
          handling401.current = false;   // [401 处理 2026-10-16] 重新登录成功，复位

          toast.success("Login Success!");
          navigate("/search");
        }
      })
      // [401 处理 2026-10-16] 同 registerUser：提示交给 handleError，这里不再重复弹 "Server error occured"
      .catch(() => {});
  };

  const isLoggedIn = () => {
    return !!user;
  };
//!!value === Boolean(value) 与上述相同

  const logout = () => {
    clearSession();   // [401 处理 2026-10-16] 清除逻辑抽成 clearSession，和 401 处理共用
    navigate("/");
  };

  return (
    <UserContext.Provider
      value={{ loginUser, user, token, logout, isLoggedIn, registerUser }}
    >
      {isReady ? children : null}
    </UserContext.Provider>
  );
};

export const useAuth = () => React.useContext(UserContext);