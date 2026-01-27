import { ChainDB } from './chain-db'
import { FIND_WHERE_ADVANCED, FIND_WHERE_BASIC, GET_HISTORY, GET_TABLE, PERSIST_NEW_DATA, GET_DOC, DELETE_DOC, GET_DOC_IDS } from './constants'
import { del, get, post } from './utils'
import { Criteria, CriteriaAdvanced, DocId, PaginatedResponse, TableDoc } from './types'
import { makeTableDocImpl, TableDocImpl } from './table-doc'

class Table<Model> {
  /**
   * The current document data
   */
  // private currentDoc: Model
  private name = ''
  private db: ChainDB

  constructor(name: string, db: ChainDB) {
    // this.currentDoc = {} as Model
    this.name = name
    this.db = db
  }

  /**
   * Create a new document in the table
   */
  async new(data: Model): Promise<TableDoc<Model>> {
    const url = `${this.db.server}${PERSIST_NEW_DATA(this.name)}`

    const body = {
      data: data,
    }

    try {
      const response = await post(url, body, this.db.auth)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }


      // Create a TableDoc instance with the document data
      return new TableDocImpl<DocId<Model>>(this.name, response.data.data?.doc_id, response.data.data as DocId<Model>, this.db)
    } catch (e: any) {
      // throw new Error(`Something went wrong with persist operation: ${e.message || String(e)}`)
      throw new Error(e)
    }
  }

  /**
   * Get the history of changes. A list of transactions from the most recent to the most old
   * in a range of depth
   * @param limit Maximum number of items to return (default: 100)
   */
  async getHistory(limit = 100, offset = 0) {
    const url = `${this.db.server}${GET_HISTORY(this.name, limit, offset)}`

    try {
      const response = await get(url, this.db.auth)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      // Create a TableDoc instance for each document in the history
      const paginatedData = response.data.data as PaginatedResponse<DocId<Model>>
      const history = paginatedData.data.map((item: DocId<Model>) => new TableDocImpl<DocId<Model>>(this.name, item.doc_id, item, this.db))

      return {
        data: history,
        total: paginatedData.total,
        offset: paginatedData.offset,
        limit: paginatedData.limit,
      } as PaginatedResponse<TableDoc<Model>>
    } catch (e: any) {
      // throw new Error(`Something went wrong with getHistory operation: ${e.message || String(e)}`)
      throw new Error(e)
    }
  }

  /**
   * Get the last record stored in the table
   */
  async last() {
    const url = `${this.db.server}${GET_TABLE(this.name)}`
    const response = await get(url, this.db.auth)
    // this.currentDoc = response.data.data ? (response.data.data as DocId<Model>) : ({} as DocId<Model>)
    // return this.currentDoc

    // Create a TableDoc instance with the document data
    const data = response.data.data ? (response.data.data as DocId<Model>) : ({} as DocId<Model>)
    return new TableDocImpl<DocId<Model>>(this.name, response.data.data?.doc_id, data, this.db)
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
   * @param reverse If true, returns items in reverse order, newer items first (default: true)
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
  async findWhere(criteria: Criteria<Model>, limit = 1000, offset = 0, reverse = true) {
    const url = `${this.db.server}${FIND_WHERE_BASIC(this.name)}`

    const body = {
      criteria,
      limit,
      offset,
      reverse,
    }

    try {
      const response = await post(url, body, this.db.auth)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      // Create a TableDoc instance for each document in the found data
      const paginatedData = response.data.data as PaginatedResponse<DocId<Model>>
      const found = paginatedData.data.map((item: DocId<Model>) => {
        const tableDocImpl = new TableDocImpl<DocId<Model>>(this.name, item.doc_id, item, this.db)
        return makeTableDocImpl<DocId<Model>>(tableDocImpl)
      })

      return {
        data: found,
        total: paginatedData.total,
        offset: paginatedData.offset,
        limit: paginatedData.limit,
      } as PaginatedResponse<TableDoc<Model>>
    } catch (e: any) {
      // throw new Error(`Something went wrong with findWhere operation: ${e.message || String(e)}`)
      throw new Error(e)
    }
  }

  /**
   * Find the first item in the table using basic criteria with exact matches
   * @param criteria Object with fields and values to match exactly, e.g.: {age: 44, name: "john"}
   * @param reverse If true, returns items in reverse order, newer items first (default: true)
   * @returns The first found item matching the criteria or null if no item is found
   */
  async find(criteria: Criteria<Model>, reverse = true) {
    const found = await this.findWhere(criteria, 1, 0, reverse)
    if (found.data.length === 0) {
      const data = {} as DocId<Model>;
      return new TableDocImpl<DocId<Model>>(this.name, '', data, this.db)
    }
    return found.data[0]
  }

  /**
   * Find the first item in the table using advanced criteria with operators
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
   * @param reverse If true, returns items in reverse order, newer items first (default: true)
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
  async findWhereAdvanced(criteria: CriteriaAdvanced<Model>[], limit = 1000, offset = 0, reverse = true) {
    const url = `${this.db.server}${FIND_WHERE_ADVANCED(this.name)}`

    const body = {
      criteria,
      limit,
      offset,
      reverse,
    }

    try {
      const response = await post(url, body, this.db.auth)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      // Create a TableDoc instance for each document in the found data
      const paginatedData = response.data.data as PaginatedResponse<DocId<Model>>
      
      const found = paginatedData.data.map((item: DocId<Model>) => {
        const tableDocImpl = new TableDocImpl<DocId<Model>>(this.name, item.doc_id, item, this.db)
        return makeTableDocImpl<DocId<Model>>(tableDocImpl)
      })

      return {
        data: found,
        total: paginatedData.total,
        offset: paginatedData.offset,
        limit: paginatedData.limit,
      } as PaginatedResponse<TableDoc<Model>>
    } catch (e: any) {
      // throw new Error(`Something went wrong with findWhereAdvanced operation: ${e.message || String(e)}`)
      throw new Error(e)
    }
  }

  /**
   * Find the first single item in the table using advanced criteria with operators
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
   * @param reverse If true, returns items in reverse order, newer items first (default: true)
   * @returns The first found item matching the criteria or null if no item is found
   * @example
   * // Find items where greeting contains "arg"
   * table.findAdvanced([
   *   {
   *     field: "greeting",
   *     operator: Operators.Contains,
   *     value: "hello"
   *   }
   * ])
   */
  async findAdvanced(criteria: CriteriaAdvanced<Model>[], reverse = true) {
    const found = await this.findWhereAdvanced(criteria, 1, 0, reverse)
    if (found.data.length === 0) {
      const data = ({} as DocId<Model>);
      return new TableDocImpl<DocId<Model>>(this.name, '', data, this.db)
    }
    return found.data[0]
  }

  /**
   * Get a specific document by its ID
   * @param doc_id The document ID to retrieve
   * @returns A TableDoc instance with the specific document data
   */
  async getByDocId(doc_id: string): Promise<TableDoc<Model>> {
    const url = `${this.db.server}${GET_DOC(this.name, doc_id)}`

    try {
      const response = await get(url, this.db.auth)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      // Create a TableDoc instance with the document data
      return new TableDocImpl<DocId<Model>>(this.name, doc_id, response.data.data as DocId<Model>, this.db)
    } catch (e: any) {
      // throw new Error(`Something went wrong with getDoc operation: ${e.message || String(e)}`)
      throw new Error(e)
    }
  }

  /**
   * Delete a specific document by its ID
   * @param doc_id The document ID to delete
   * @returns Document deletion response
   */
  async deleteDoc(doc_id: string) {
    const url = `${this.db.server}${DELETE_DOC(this.name, doc_id)}`
    const response = await del(url, this.db.auth)
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data
  }

  /**
   * Get the document IDs of a table
   * @param limit Limit of document IDs to retrieve
   * @param offset Offset of document IDs to retrieve
   * @param reverse Reverse order of document IDs
   * @returns Document IDs
   */
  async getDocIds(limit = 50, offset = 0, reverse = true) {
    const url = `${this.db.server}${GET_DOC_IDS(this.name, limit, offset, reverse)}`
    const response = await get(url, this.db.auth)
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data as PaginatedResponse<string>
  }
}

export default Table
