import React, { useEffect,  useState } from "react";
import axios from "axios";
import { handleError } from "../Helpers/ErrorHandler"
import type { ReportGet, ReportCreate } from "../Models/Report";



const baseApi = `${import.meta.env.VITE_API_BASE}/api/report`;


export const getReport = async () => {
    try {
        const response = await axios.get<ReportGet[]>(`${baseApi}`);
        return response.data;
    } catch (error) {
        handleError(error);
        return [];
    }
};


export const getReportById = async (reportId: string) => {
    try {
        const response = await axios.get<ReportGet>(`${baseApi}/${reportId}`);
        return response.data;
    } catch (error) {
        handleError(error);
        return null;
    }
}

export const createReport = async (reportData: ReportCreate) => {
    try {
        const response = await axios.post<ReportGet>(`${baseApi}`, reportData);
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

export const deleteReport = async (reportId: string) => {
    try {
        await axios.delete(`${baseApi}/${reportId}`); 
    } catch (error) {
        handleError(error);
    }
}