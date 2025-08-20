import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import { apiSlice } from "../api/apiSlice";
import { saveToLocalStorage } from "../../Utils/localStorage";
import sessionReducer from "../features/auth/authSlice";

//各个模块
import factorReducer from '../features/Factors/factorSlice';

//const initialFavorites = saveToLocalStorage
export const store = configureStore({
  reducer: {
    factor: factorReducer,
    session: sessionReducer,
    // 其他slice可以按模块继续加
  },
});

// 类型推导（供 useSelector/useDispatch 使用）
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;