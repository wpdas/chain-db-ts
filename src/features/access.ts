import sha256 from 'sha256'

export class Access {
  user = ''
  password = ''

  constructor(user: string, password: string) {
    this.user = user
    this.password = password
  }

  parse = (data_base: string, table_name: string) => {
    const access_info = `${data_base}${table_name}${this.user}${this.password}`
    return sha256(access_info)
  }
}
