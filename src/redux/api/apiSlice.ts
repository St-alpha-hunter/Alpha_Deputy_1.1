import { fetchBaseQuery, createApi} from '@reduxjs/toolkit/query/react';
import { BASE_URL } from "../features/constant.ts";

const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials:'include',
})

export const apiSlice = createApi({
    baseQuery,
    tagTypes:['User','Factor','Strategy','Analysis'],
    endpoints:() => ({})
});