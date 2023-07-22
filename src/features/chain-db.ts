import sha256 from 'sha256'
import axios from 'axios'
import { Access } from './access'
import {
  API,
  CHECK_USER_NAME,
  CREATE_USER_ACCOUNT,
  GET_ALL_TRANSFER_BY_USER_ID,
  GET_TRANSFER_BY_USER_ID,
  GET_USER_ACCOUNT,
  GET_USER_ACCOUNT_BY_ID,
  TRANSFER_UNITS,
} from './constants'
import { BasicResponse, SignedUserAccount, TransferUnitsRegistry } from './types'
import { post } from './utils'
import * as table from './table'

export class ChainDB {
  api: string = ''
  name: string = ''
  access: Access | null = null
  access_key: string = ''

  /**
   * Connection information.
   * @param server Server location. If the `server` parameter is empty, then "http://localhost" will be used.
   * @param data_base Data base name
   * @param user  User to access the data base
   * @param password  Password to access the data base
   */
  connect(server: string | null, data_base: string, user: string, password: string) {
    const key_data = `${data_base}${user}${password}`

    let key = sha256(key_data)

    this.api = server || API
    this.name = data_base
    this.access = new Access(user, password)
    this.access_key = key
  }

  /**
   * Create a new user account inside the connected table
   * @param user_name
   * @param password
   * @param units
   * @param password_hint
   * @returns
   */
  async create_user_account(user_name: string, password: string, units?: number, password_hint?: string) {
    const url = `${this.api}${CREATE_USER_ACCOUNT}`

    const body = {
      db_access_key: this.access_key,
      user_name: user_name,
      password: password,
      password_hint: password_hint,
      units: units,
    }

    try {
      let response = await post(url, body)
      return await (response.data as Promise<BasicResponse<SignedUserAccount>>)
    } catch {
      throw new Error('Something went wrong!')
    }
  }

  /**
   * Get user account info (login method)
   * @param user_name
   * @param password
   * @returns
   */
  async get_user_account(user_name: string, password: string) {
    const url = `${this.api}${GET_USER_ACCOUNT}/${user_name}/${password}/${this.access_key}`
    try {
      let response = await axios.get(url)
      return await (response.data as Promise<BasicResponse<SignedUserAccount>>)
    } catch {
      throw new Error('Something went wrong!')
    }
  }

  /**
   * Get user account info by its id
   * @param user_id
   * @returns
   */
  async get_user_account_by_id(user_id: string) {
    const url = `${this.api}${GET_USER_ACCOUNT_BY_ID}/${user_id}/${this.access_key}`
    try {
      let response = await axios.get(url)
      return await (response.data as Promise<BasicResponse<SignedUserAccount>>)
    } catch {
      throw new Error('Something went wrong!')
    }
  }

  /**
   * Check if user_name is already taken
   * @param user_name
   */
  async check_user_name(user_name: string) {
    const url = `${this.api}${CHECK_USER_NAME}/${user_name}/${this.access_key}`
    try {
      let response = await axios.get(url)
      return await (response.data as Promise<BasicResponse<string>>)
    } catch {
      throw new Error('Something went wrong!')
    }
  }

  /**
   * Transfer units between users
   * @param from user_id
   * @param to user_id
   * @param units
   * @returns
   */
  async transfer_units(from: string, to: string, units: number) {
    const url = `${this.api}${TRANSFER_UNITS}`

    const body = {
      db_access_key: this.access_key,
      from: from,
      to: to,
      units: units,
    }

    try {
      let response = await post(url, body)
      return await (response.data as Promise<BasicResponse<null>>)
    } catch {
      throw new Error('Something went wrong!')
    }
  }

  /**
   * Fetch the last Transference of units Records by User
   * @param user_id
   * @returns
   */
  async get_transfer_by_user_id(user_id: string) {
    const url = `${this.api}${GET_TRANSFER_BY_USER_ID}/${user_id}/${this.access_key}`

    try {
      let response = await axios.get(url)
      return await (response.data as Promise<BasicResponse<TransferUnitsRegistry>>)
    } catch {
      throw new Error('Something went wrong!')
    }
  }

  /**
   * Fetch all Transference of units Records by User
   * @param user_id
   * @returns
   */
  async get_all_transfers_by_user_id(user_id: string) {
    const url = `${this.api}${GET_ALL_TRANSFER_BY_USER_ID}/${user_id}/${this.access_key}`

    try {
      let response = await axios.get(url)
      return await (response.data as Promise<BasicResponse<TransferUnitsRegistry[]>>)
    } catch {
      throw new Error('Something went wrong!')
    }
  }

  /**
   * Initialize a table, fetching its more updated data
   */

  async get_table<Model>(table_name: string, model: Model) {
    const chainDbCopy = connect(this.api, this.name, this.access!.user, this.access!.password)
    const table_data = await table.get<Model>(chainDbCopy, table_name, model)

    // NOTE: Although only the "table" and "persist" properties are displayed by
    // the lint, all Table properties are being exposed.
    // This is due to a javascript limitation on classes.
    //
    // There was an attempt to return a new object with only the required
    // data, but this generates an error in the "this" instance of the Table.
    return table_data as {
      table: Model
      /**
       * Persist table data on chain
       */
      persist: () => Promise<void>
    }
  }
}

export const connect = (server: string | null, data_base: string, user: string, password: string) => {
  let chainDb = new ChainDB()
  chainDb.connect(server, data_base, user, password)
  return chainDb
}
