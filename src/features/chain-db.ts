import { DEFAULT_API_SERVER, CONNECT } from './constants'
import { post } from './utils'
import Table from './table'
import { Connection } from './types'

export class ChainDB {
  server: string = DEFAULT_API_SERVER
  database: string = ''
  auth: string = ''

  /**
   * Connection information.
   * @param server Server location. If the `server` parameter is empty, then "http://localhost" will be used.
   * @param data_base Data base name
   * @param user  User to access the data base
   * @param password  Password to access the data base
   */
  async connect(connection: Connection) {
    const { server, database, user, password } = connection
    this.server = server || DEFAULT_API_SERVER
    this.database = database

    try {
      const response = await post(`${this.server}${CONNECT}`, {
        name: this.database,
        user: user,
        password: password,
      })

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      this.auth = response.data.data
    } catch (e: any) {
      throw new Error(`Something went wrong! ${e.message || String(e)}`)
    }
  }

  /**
   * Initialize a table, fetching its more updated data
   */

  async get_table<Model>(table_name: string) {
    const tableData = new Table<Model>(table_name, this)
    await tableData.refetch()
    return tableData
    // const table_data = await table.get<Model>(this, table_name, model)

    // NOTE: Although only the "table" and "persist" properties are displayed by
    // the lint, all Table properties are being exposed.
    // This is due to a javascript limitation on classes.
    //
    // There was an attempt to return a new object with only the required
    // data, but this generates an error in the "this" instance of the Table.

    // return table_data as {
    //   table: Model
    //   /**
    //    * Persist table data on chain
    //    */
    //   persist: () => Promise<void>
    //   /**
    //    * Get the history of changes. A list of transactions from the most recent to the most old
    //    * in a range of depth
    //    * @param depth
    //    */
    //   getHistory: (depth: number) => Promise<Model[]>
    // }
  }
}

export const connect = async (connection: Connection) => {
  let chainDb = new ChainDB()
  await chainDb.connect(connection)
  return chainDb
}
