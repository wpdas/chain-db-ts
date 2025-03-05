import axios from 'axios'
import { BasicResponse } from './types'

export const post = (url: string, body: any, auth = '') =>
  axios.post<BasicResponse<any>>(url, body, {
    headers: { 'content-type': 'application/json', Authorization: `Basic ${auth}` },
  })
