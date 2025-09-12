import React, { useEffect,  useState } from "react";
import axios from "axios";
import { handleError } from "../Helpers/ErrorHandler"
import type { ReportGet } from "../Models/Report";



const baseApi = `${import.meta.env.VITE_API_BASE}/report`;


export const getReport = async () => {
    try {
        const response = await axios.get<ReportGet[]>(`${baseApi}`);
        return response.data;
    } catch (error) {
        handleError(error);
        return [];
    }
};
