import axios from 'axios'

export const post = (url: string, body: any) =>
  axios.post(url, body, { headers: { 'content-type': 'application/json' } })
