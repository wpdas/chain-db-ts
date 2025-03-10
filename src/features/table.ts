import axios from 'axios'
import { ChainDB } from './chain-db'
import { FIND_WHERE_ADVANCED, FIND_WHERE_BASIC, GET_HISTORY, GET_TABLE, PERSIST_NEW_DATA, GET_DOC } from './constants'
import { post } from './utils'
import { Criteria, CriteriaAdvanced, DocId, TableDoc } from './types'
import { TableDocImpl } from './table-doc'

class Table<Model> {
  /**
   * The current document data
   */
  public currentDoc: Model
  private name = ''
  private db: ChainDB

  constructor(name: string, db: ChainDB) {
    this.currentDoc = {} as Model
    this.name = name
    this.db = db
  }

  /**
   * Persist table's document data changes
   */
  async persist(): Promise<DocId<Model>> {
    const url = `${this.db.server}${PERSIST_NEW_DATA(this.name)}`

    const body = {
      data: this.currentDoc,
    }

    try {
      const response = await post(url, body, this.db.auth)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      return response.data.data as DocId<Model>
    } catch (e: any) {
      throw new Error(`Something went wrong with persist operation: ${e.message || String(e)}`)
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
      return response.data.data as DocId<Model>[]
    } catch (e: any) {
      throw new Error(`Something went wrong with getHistory operation: ${e.message || String(e)}`)
    }
  }

  /**
   * Refetch the table data
   */
  async refetch() {
    const url = `${this.db.server}${GET_TABLE(this.name)}`

    try {
      const response = await axios.get(url, { headers: { Authorization: `Basic ${this.db.auth}` } })
      this.currentDoc = response.data.data ? (response.data.data as DocId<Model>) : ({} as DocId<Model>)
    } catch (e: any) {
      throw new Error(`Something went wrong with refetch operation: ${e.message || String(e)}`)
    }
  }

  /**
   * Check if the table is empty
   */
  isEmpty() {
    return Object.keys(this.currentDoc as {}).length === 0
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
      return response.data.data as DocId<Model>[]
    } catch (e: any) {
      throw new Error(`Something went wrong with findWhere operation: ${e.message || String(e)}`)
    }
  }

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
      return response.data.data as DocId<Model>[]
    } catch (e: any) {
      throw new Error(`Something went wrong with findWhereAdvanced operation: ${e.message || String(e)}`)
    }
  }

  /**
   * Get the current document ID
   */
  getCurrentDocId() {
    return (this.currentDoc as DocId<Model>).doc_id
  }

  /**
   * Get a specific document by its ID
   * @param doc_id The document ID to retrieve
   * @returns A TableDoc instance with the specific document data
   */
  async getDoc(doc_id: string): Promise<TableDoc<Model>> {
    const url = `${this.db.server}${GET_DOC(this.name, doc_id)}`

    try {
      const response = await axios.get(url, { headers: { Authorization: `Basic ${this.db.auth}` } })

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      // Create a TableDoc instance with the document data
      return new TableDocImpl<DocId<Model>>(this.name, doc_id, response.data.data as DocId<Model>, this.db)
    } catch (e: any) {
      throw new Error(`Something went wrong with getDoc operation: ${e.message || String(e)}`)
    }
  }
}

export default Table
