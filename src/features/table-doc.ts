import axios from 'axios'
import { ChainDB } from './chain-db'
import { DocId, TableDoc } from './types'
import { UPDATE_ITEM, GET_DOC } from './constants'
import { post } from './utils'

/**
 * Implementation of TableDoc interface
 * Represents a specific document from a table
 */
export class TableDocImpl<Model> implements TableDoc<Model> {
  /**
   * The document data
   */
  public doc: DocId<Model>

  /**
   * The document ID
   */
  private doc_id: string

  private tableName: string
  private db: ChainDB

  constructor(tableName: string, doc_id: string, data: DocId<Model>, db: ChainDB) {
    this.tableName = tableName
    this.doc_id = doc_id
    this.doc = data
    this.db = db
  }

  /**
   * Update the document data
   * This will update the specific document without creating a new one
   */
  async update(): Promise<void> {
    const url = `${this.db.server}${UPDATE_ITEM(this.tableName)}`

    const body = {
      data: this.doc,
      doc_id: this.doc_id,
    }

    try {
      const response = await post(url, body, this.db.auth)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      // Return the updated document
      // return response.data.data as DocId<Model>
    } catch (e: any) {
      throw new Error(`Something went wrong updating document ${this.doc_id}: ${e.message || String(e)}`)
    }
  }

  /**
   * Refetch the document data from the database
   * Useful when the document might have been updated by another application
   */
  async refetch(): Promise<void> {
    const url = `${this.db.server}${GET_DOC(this.tableName, this.doc_id)}`

    try {
      const response = await axios.get(url, { headers: { Authorization: `Basic ${this.db.auth}` } })

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      // Update the table data with the latest data from the database
      this.doc = response.data.data as DocId<Model>
    } catch (e: any) {
      throw new Error(`Something went wrong refetching document ${this.doc_id}: ${e.message || String(e)}`)
    }
  }

  /**
   * Get the table name this document belongs to
   */
  getTableName(): string {
    return this.tableName
  }

  /**
   * Check if the table is empty
   */
  isEmpty() {
    return Object.keys(this.doc as {}).length === 0
  }
}
