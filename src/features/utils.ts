import axios from 'axios'
import { BasicResponse } from './types'

// Using Axios

export const post = (url: string, body: any, auth = '') =>
  axios.post<BasicResponse<any>>(url, body, {
    headers: { 'content-type': 'application/json', Authorization: `Basic ${auth}` },
  })

export const get = (url: string, auth = '') =>
  axios.get<BasicResponse<any>>(url, {
    headers: { Authorization: `Basic ${auth}` },
  })
