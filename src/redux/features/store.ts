import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import { apiSlice } from "../api/apiSlice";
import { saveToLocalStorage } from "../../Utils/localStorage";


//const initialFavorites = saveToLocalStorage