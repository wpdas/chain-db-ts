import { DEFAULT_API_SERVER, CONNECT, WEB_SOCKET_EVENTS, CREATE_DATABASE } from './constants'
import { post } from './utils'
import Table from './table'
import { Connection, ConnectionWithToken, DatabaseCreation, EventCallback } from './types'
import Events from './events'

export class ChainDB {
  server: string = DEFAULT_API_SERVER
  database: string = ''
  auth: string = ''
  private _events: Events | null = null

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
   * Connect to Chain DB with a token (Synchronously). This is useful if you don't want to use a promise to connect to Chain DB.
   * @param connection Connection information with token
   */
  connectWithToken(connection: ConnectionWithToken) {
    const { server, database, token } = connection
    this.server = server || DEFAULT_API_SERVER
    this.database = database
    this.auth = token
  }

  /**
   * Initialize a table, fetching its more updated data
   */
  getTable<Model>(table_name: string) {
    const tableData = new Table<Model>(table_name, this)
    // await tableData.refetch()
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

  events() {
    return {
      /**
       * Subscribe to an event
       * @param event Event name to subscribe to @see {EventTypes}
       * @param callback Function to call when the event is received
       */
      subscribe: (event: string, callback: EventCallback) => {
        if (this._events === null) {
          const wsUrl = `${this.server.replace('http', 'ws')}${WEB_SOCKET_EVENTS}`
          this._events = new Events(wsUrl, this.auth)
        }

        this._events?.subscribe(event, callback)
      },

      /**
       * Unsubscribe from an event
       * @param event Event name to unsubscribe from @see {EventTypes}
       * @param callback Optional callback to remove. If not provided, all callbacks for the event will be removed.
       */
      unsubscribe: (event: string, callback?: EventCallback) => {
        if (!this._events || !this._events.isConnected()) {
          return
        }

        this._events.unsubscribe(event, callback)
      },

      /**
       * Close the events transmission
       */
      closeEvents: () => {
        this._events?.close()
      },
    }
  }
}

/**
 * Create a new database
 * @param databaseCreation Database creation information
 * @returns Database creation response
 */
export const createDatabase = async (databaseCreation: DatabaseCreation) => {
  const { server, database, user, password } = databaseCreation;
  const url = `${server || DEFAULT_API_SERVER}${CREATE_DATABASE}`
  const response = await post(url, { name: database, user: user, password: password })
  if (!response.data.success) {
    throw new Error(response.data.message)
  }
  return response.data.data
}

/**
 * Connect to a database
 * @param connection Connection information
 * @returns 
 */
export const connect = async (connection: Connection) => {
  let chainDb = new ChainDB()
  await chainDb.connect(connection)
  return chainDb
}

/**
 * Connect to a database with a token
 * @param connection Connection information with token
 * @returns 
 */
export const connectWithToken = (connection: ConnectionWithToken) => {
  let chainDb = new ChainDB()
  chainDb.connectWithToken(connection)
  return chainDb
}