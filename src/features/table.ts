import axios from 'axios'
import { ChainDB } from './chain-db'
import {
  FIND_WHERE_ADVANCED,
  FIND_WHERE_BASIC,
  GET_HISTORY,
  GET_TABLE,
  PERSIST_NEW_DATA,
  UPDATE_LAST_ITEM,
} from './constants'
import { post } from './utils'
import { Criteria, CriteriaAdvanced } from './types'

class Table<Model> {
  public table: Model // This is the table data
  private name = ''
  private db: ChainDB

  constructor(name: string, db: ChainDB) {
    this.table = {} as Model
    this.name = name
    this.db = db
  }

  /**
   * Persist table data changes
   */
  async persist() {
    const url = `${this.db.server}${PERSIST_NEW_DATA(this.name)}`

    const body = {
      data: this.table,
    }

    try {
      const response = await post(url, body, this.db.auth)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }
    } catch {
      throw new Error('Something went wrong!')
    }
  }

  /**
   * Update data of the last table's item (or create a new item if there is none).
   * This ensures that no new item is created.
   */
  async update() {
    const url = `${this.db.server}${UPDATE_LAST_ITEM(this.name)}`

    const body = {
      data: this.table,
    }

    try {
      const response = await post(url, body, this.db.auth)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }
    } catch {
      throw new Error('Something went wrong!')
    }
  }

  /**
   * Get the history of changes. A list of transactions from the most recent to the most old
   * in a range of depth
   * @param limit
   */
  async getHistory(limit: number) {
    const url = `${this.db.server}${GET_HISTORY(this.name, limit)}`

    try {
      const response = await axios.get(url, { headers: { Authorization: `Basic ${this.db.auth}` } })

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      // Return data. Only table fields, e.g.: [{fieldA: 'Hi', filedB: 22}]
      return response.data.data as Model[]
    } catch {
      throw new Error('Something went wrong!')
    }
  }

  /**
   * Refetch the table data
   */
  async refetch() {
    const url = `${this.db.server}${GET_TABLE(this.name)}`

    try {
      const response = await axios.get(url, { headers: { Authorization: `Basic ${this.db.auth}` } })
      this.table = response.data.data ? (response.data.data as Model) : ({} as Model)
    } catch {
      throw new Error('Something went wrong!')
    }
  }

  /**
   * Check if the table is empty
   */
  isEmpty() {
    return Object.keys(this.table as {}).length === 0
  }

  /**
   * Get the table's name
   */
  getName() {
    return this.name
  }

  /**
   * Find items in the table using basic criteria with exact matches
   * @param criteria Object with fields and values to match exactly, e.g.: {age: 44, name: "john"}
   * @param limit Maximum number of items to return (default: 1000)
   * @param reverse If true, returns items in reverse order (default: true)
   * @returns Array of found items matching the criteria
   * @example
   * // Find items where age is 44
   * table.findWhere({
   *   age: 44,
   * })
   *
   * // Find items with multiple criteria
   * table.findWhere({
   *   age: 44,
   *   name: "john",
   *   active: true,
   *   score: 100
   * })
   */
  async findWhere(criteria: Criteria<Model>, limit = 1000, reverse = true) {
    const url = `${this.db.server}${FIND_WHERE_BASIC(this.name)}`

    const body = {
      criteria,
      limit,
      reverse,
    }

    try {
      const response = await post(url, body, this.db.auth)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      // Return found data. Only table fields, e.g.: [{fieldA: 'Hi', filedB: 22}]
      return response.data.data as Model[]
    } catch {
      throw new Error('Something went wrong!')
    }
  }

  // TODO: Implement documentation

  /**
   * Find items in the table using advanced criteria with operators
   * @param criteria Array of criteria to filter items. Each criteria contains:
   * - field: The field name to filter
   * - operator: The operator to use in comparison. Available operators:
   *   - Eq (==) Equal
   *   - Ne (!=) Not Equal
   *   - Gt (>) Greater Than
   *   - Ge (>=) Greater Than or Equal
   *   - Lt (<) Less Than
   *   - Le (<=) Less Than or Equal
   *   - Contains: Check if field contains value (for strings and arrays)
   *   - StartsWith: Check if field starts with value (for strings)
   *   - EndsWith: Check if field ends with value (for strings)
   * - value: The value to compare against
   * @param limit Maximum number of items to return (default: 1000)
   * @param reverse If true, returns items in reverse order (default: true)
   * @returns Array of found items matching the criteria
   * @example
   * // Find items where greeting contains "arg"
   * table.findWhereAdvanced([
   *   {
   *     field: "greeting",
   *     operator: Operators.Contains,
   *     value: "hello"
   *   }
   * ])
   */
  async findWhereAdvanced(criteria: CriteriaAdvanced<Model>[], limit = 1000, reverse = true) {
    const url = `${this.db.server}${FIND_WHERE_ADVANCED(this.name)}`

    const body = {
      criteria,
      limit,
      reverse,
    }

    try {
      const response = await post(url, body, this.db.auth)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      // Return found data. Only table fields, e.g.: [{fieldA: 'Hi', filedB: 22}]
      return response.data.data as Model[]
    } catch {
      throw new Error('Something went wrong!')
    }
  }
}

export default Table
