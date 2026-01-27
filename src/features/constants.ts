// Contants
export const DEFAULT_API_SERVER = 'http://localhost:2818'
export const API_BASE = '/api/v1'
export const CREATE_DATABASE = `${API_BASE}/database/create`
export const CONNECT = `${API_BASE}/database/connect`
export const GET_TABLE = (table: string) => `${API_BASE}/table/${table}`
export const UPDATE_ITEM = (table: string) => `${API_BASE}/table/${table}/update`
export const PERSIST_NEW_DATA = (table: string) => `${API_BASE}/table/${table}/persist`
export const GET_HISTORY = (table: string, limit = 25, offset = 0) => `${API_BASE}/table/${table}/history?limit=${limit}&offset=${offset}`
export const FIND_WHERE_BASIC = (table: string) => `${API_BASE}/table/${table}/find`
export const FIND_WHERE_ADVANCED = (table: string) => `${API_BASE}/table/${table}/find-advanced`
export const GET_DOC = (table: string, doc_id: string) => `${API_BASE}/table/${table}/doc/${doc_id}`
export const WEB_SOCKET_EVENTS = `${API_BASE}/events`
export const GET_TABLES = `${API_BASE}/tables`
export const DELETE_TABLE = (table: string) => `${API_BASE}/table/${table}`
export const DELETE_DOC = (table: string, doc_id: string) => `${API_BASE}/table/${table}/doc/${doc_id}`
/**
 * Get the document IDs of a table
 * @param table Table name
 * @param limit Limit of document IDs to retrieve
 * @param offset Offset of document IDs to retrieve
 * @param reverse Reverse order of document IDs
 * @returns Document IDs
 */
export const GET_DOC_IDS = (table: string, limit = 50, offset = 0, reverse = true) => `${API_BASE}/table/${table}/doc-ids?limit=${limit}&offset=${offset}&reverse=${reverse}`