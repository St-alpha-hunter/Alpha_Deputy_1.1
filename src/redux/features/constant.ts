//暂时去预留后端地址
const apiBase = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

export const BASE_URL: string = `${apiBase}/api`;
