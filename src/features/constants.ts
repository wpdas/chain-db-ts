// Contants
export const DEFAULT_API_SERVER = 'http://localhost:2818'
export const API_BASE = '/api/v1'
export const CONNECT = `${API_BASE}/database/connect`
export const GET_TABLE = (table: string) => `${API_BASE}/table/${table}`
export const UPDATE_LAST_ITEM = (table: string) => `${API_BASE}/table/${table}/update`
export const PERSIST_NEW_DATA = (table: string) => `${API_BASE}/table/${table}/persist`
export const GET_HISTORY = (table: string, limit = 25) => `${API_BASE}/table/${table}/history?limit=${limit}`
export const FIND_WHERE_BASIC = (table: string) => `${API_BASE}/table/${table}/find`
export const FIND_WHERE_ADVANCED = (table: string) => `${API_BASE}/table/${table}/find-advanced`
export const WEB_SOCKET_EVENTS = `${API_BASE}/events`
